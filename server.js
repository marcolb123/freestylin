// ═══════════════════════════════════════════════════════════
// 🔌 IMPORTS: Load required packages
// ═══════════════════════════════════════════════════════════
import { pathToFileURL } from 'node:url';
import express from 'express';        // Web server framework
import cors from 'cors';              // Allow frontend to talk to backend
import dotenv from 'dotenv';          // Load .env file
import mongoose from 'mongoose';      // MongoDB object modeling
import bcrypt from 'bcryptjs';        // Password hashing
import jwt from 'jsonwebtoken';        // JSON Web Token
import { STYLES } from './styles.js';
import { Prompt } from './prompt-model.js';
import { extractYouTubeId } from './src/youtube.js';
import { isWebUrl } from './src/web-url.js';

dotenv.config();

// ═══════════════════════════════════════════════════════════
// ⚙️ SETUP: Initialize server
// ═══════════════════════════════════════════════════════════
const app = express();
if (process.env.TRUSTED_PROXY_CIDRS) {
  app.set('trust proxy', process.env.TRUSTED_PROXY_CIDRS);
}

// Configure CORS for production
const ALLOWED_ORIGINS = [
  'http://localhost:3000',                    // Local development (the port vite.config.js sets)
  'http://localhost:5173',                    // Vite's default, if the config port is changed back
  'http://localhost:5174',                    // Alternative local port
  'https://freestylin.netlify.app',           // Production frontend
];

// Netlify serves deploy previews and branch deploys from generated subdomains
// of the same site — deploy-preview-7--freestylin.netlify.app,
// my-branch--freestylin.netlify.app. Those are separate origins, so without
// this every preview build loads and then fails every API call on CORS,
// leaving reviewers looking at an error page. Anchored to this site's
// subdomain, so it can't match an unrelated host.
const NETLIFY_PREVIEW = /^https:\/\/[a-z0-9][a-z0-9-]*--freestylin\.netlify\.app$/;

app.use(cors({
  origin(origin, callback) {
    // Same-origin requests, curl, and server-to-server calls send no Origin.
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || NETLIFY_PREVIEW.test(origin)) {
      return callback(null, true);
    }
    // Withhold the header rather than throwing: the browser blocks the response
    // either way, but throwing turns every disallowed origin into a 500 plus a
    // stack trace in the logs.
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ inflate: false }));

// ═══════════════════════════════════════════════════════════
// 📊 MONGODB SCHEMAS
// ═══════════════════════════════════════════════════════════
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  favoritePrompts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prompt' }],
  createdAt: { type: Date, default: Date.now }
});

// Add index on favoritePrompts for faster queries
UserSchema.index({ favoritePrompts: 1 });

// Style list lives in styles.js so the enum, the API validation, the seed
// scripts and the frontend filter can't drift apart.

// A dancer's log of what they trained on a given day.
// `date` is stored as a 'YYYY-MM-DD' string rather than a Date so that "which
// day did I train" is anchored to the dancer's own calendar, not to UTC —
// otherwise an evening session logged in a negative-offset timezone rolls over
// into tomorrow and breaks streaks.
const JournalEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  prompts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prompt' }],
  notes: { type: String, default: '', maxlength: 5000 },
  durationMinutes: { type: Number, min: 0, max: 1440, default: 0 },
  energy: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// One entry per dancer per day — POST upserts into it.
JournalEntrySchema.index({ user: 1, date: -1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

// ═══════════════════════════════════════════════════════════
// 🔐 AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    // The token can outlive the account. Without this, req.user is null and
    // every downstream handler (adminMiddleware included) throws a 500 where
    // it should be a clean 401.
    if (!req.user) return res.status(401).json({ error: 'Invalid token' });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return res.status(401).json({ error: 'Invalid token' });
    next(error);
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// 🔑 AUTH ROUTES
// ═══════════════════════════════════════════════════════════
// Bounded local counters. Hosting should also apply shared limits across instances.
function rateLimit(max) {
  const clients = new Map();
  let currentWindow;
  return (req, res, next) => {
    const window = Math.floor(Date.now() / 60_000);
    if (currentWindow !== window) {
      clients.clear();
      currentWindow = window;
    }
    const key = req.ip;
    const count = clients.get(key) || 0;
    if (count >= max || (!count && clients.size >= 10_000)) {
      return res.set('Retry-After', '60').status(429).json({ error: 'Too many requests. Try again shortly.' });
    }
    clients.set(key, count + 1);
    next();
  };
}
const authLimit = rateLimit(20);
const engagementLimit = rateLimit(60);
const searchLimit = rateLimit(120);

app.post('/api/auth/register', authLimit, async (req, res) => {
  try {
    const { username, email, password } = req.body ?? {};
    if (typeof username !== 'string' || !username.trim() || username.length > 80 ||
        typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ error: 'Enter a valid username, email and password of at least 8 characters and at most 72 bytes' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username, email, isAdmin: user.isAdmin } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Unable to register with those details' });
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Unable to register' });
  }
});

app.post('/api/auth/login', authLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email, isAdmin: user.isAdmin } });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const { id, username, email, isAdmin } = req.user;
  res.json({ id, username, email, isAdmin });
});

// ═══════════════════════════════════════════════════════════
// 📝 PROMPT ROUTES
// ═══════════════════════════════════════════════════════════
// Single source of truth for the style list, so the frontend filter can't
// drift out of sync with what the schema actually accepts.
app.get('/api/styles', (req, res) => res.json(STYLES));

function readPage(req, res, isCursor) {
  const { after, limit } = req.query;
  const pageSize = limit === undefined ? 100 : Number(limit);
  if ((after !== undefined && !isCursor(after)) ||
      (limit !== undefined && (typeof limit !== 'string' || !/^\d+$/.test(limit))) ||
      !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    res.status(400).json({ error: 'Invalid page cursor or limit' });
    return null;
  }
  return { after, pageSize };
}

app.get('/api/prompts', searchLimit, async (req, res) => {
  try {
    const { search, status, userId, style } = req.query;
    if (status !== undefined && !['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid prompt status' });
    }
    // Only admins may request non-approved statuses (pending/rejected submissions)
    const filter = {};
    if (status && status !== 'approved') {
      const token = req.headers.authorization?.split(' ')[1];
      let requester = null;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        requester = await User.findById(decoded.userId);
      } catch {
        // no-op: requester stays null, falls through to 403 below
      }
      if (!requester?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      filter.status = status;
    } else {
      filter.status = 'approved';  // Default to approved for public viewing
    }
    
    if (style) {
      if (!STYLES.includes(style)) {
        return res.status(400).json({ error: `Unknown style. Expected one of: ${STYLES.join(', ')}` });
      }
      filter.style = style;
    }

    if (search !== undefined && (typeof search !== 'string' || search.length > 100)) {
      return res.status(400).json({ error: 'Search must be a string of at most 100 characters' });
    }
    if (search) {
      const literal = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { label: { $regex: literal, $options: 'i' } },
        { description: { $regex: literal, $options: 'i' } }
      ];
    }
    
    const page = readPage(req, res, mongoose.isObjectIdOrHexString);
    if (!page) return;
    if (page.after) filter._id = { $gt: page.after };
    const query = Prompt.find(filter).sort({ _id: 1 }).limit(page.pageSize);
    if (search) query.maxTimeMS(1500);
    if (req.query.fields === 'summary') query.select('label style');
    else query.populate('submittedBy', 'username');
    const prompts = await query;
    
    // If userId provided, add isFavorited field to each prompt (only for the authenticated owner)
    if (userId) {
      const token = req.headers.authorization?.split(' ')[1];
      let requesterId = null;
      try {
        requesterId = jwt.verify(token, process.env.JWT_SECRET).userId;
      } catch {
        // no-op: unauthenticated/invalid token, favorites enrichment skipped below
      }
      if (requesterId !== userId) {
        return res.json(prompts);
      }

      const user = await User.findById(userId);
      const favoriteIds = new Set(user?.favoritePrompts?.map(id => id.toString()));
      
      const promptsWithFavorites = prompts.map(prompt => ({
        ...prompt.toObject(),
        isFavorited: favoriteIds.has(prompt._id.toString())
      }));
      
      return res.json(promptsWithFavorites);
    }
    
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prompts', authMiddleware, async (req, res) => {
  try {
    const { label, description, tips, drills, links, style } = req.body ?? {};

    // Validate required fields
    if (typeof label !== 'string' || !label.trim() || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Label and description are required' });
    }

    if (style && !STYLES.includes(style)) {
      return res.status(400).json({ error: `Unknown style. Expected one of: ${STYLES.join(', ')}` });
    }
    
    if ((tips !== undefined && (!Array.isArray(tips) || tips.some(tip => typeof tip !== 'string'))) ||
        (drills !== undefined && !Array.isArray(drills)) ||
        (links !== undefined && !Array.isArray(links))) {
      return res.status(400).json({ error: 'Invalid tips, drills or links' });
    }

    // Validate drills array structure
    if (drills && Array.isArray(drills)) {
      for (const drill of drills) {
        if (typeof drill?.icon !== 'string' || !drill.icon || typeof drill.text !== 'string' || !drill.text) {
          return res.status(400).json({ error: 'Each drill must have an icon and text' });
        }
      }
    }
    
    // Validate and process links array structure
    if (links && Array.isArray(links)) {
      for (const link of links) {
        if (typeof link?.title !== 'string' || !link.title || typeof link.url !== 'string' || !link.url) {
          return res.status(400).json({ error: 'Each link must have a title and url' });
        }
        
        // Validate link type
        if (link.type && !['youtube', 'website'].includes(link.type)) {
          return res.status(400).json({ error: 'Link type must be either "youtube" or "website"' });
        }
        
        if (!isWebUrl(link.url)) {
          return res.status(400).json({ error: 'Resources must use HTTP or HTTPS' });
        }

        const videoId = extractYouTubeId(link.url);
        if (link.type === 'youtube' && !videoId) {
          return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        delete link.videoId;
        if (videoId) {
          link.videoId = videoId;
          link.type ??= 'youtube';
        }

        // Default to website if no type specified
        if (!link.type) {
          link.type = 'website';
        }
      }
    }
    
    const prompt = new Prompt({
      label, description, style, tips,
      drills: drills?.map(({ icon, text }) => ({ icon, text })),
      links: links?.map(({ title, url, type, videoId }) => ({ title, url, type, videoId })),
      status: 'pending', likes: 0, views: 0, submittedBy: req.user._id
    });
    await prompt.save();
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/prompts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body ?? {};
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid moderation status' });
    }
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true });
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/prompts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndDelete(req.params.id);
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json({ message: 'Prompt deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/prompts/:id/like', engagementLimit, async (req, res) => {
  try {
    const prompt = await Prompt.findOneAndUpdate(
      { _id: req.params.id, status: 'approved' },
      { $inc: { likes: 1 } },
      { new: true, projection: { likes: 1 } }
    );
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/prompts/:id/view', engagementLimit, async (req, res) => {
  try {
    const prompt = await Prompt.findOneAndUpdate(
      { _id: req.params.id, status: 'approved' },
      { $inc: { views: 1 } },
      { new: true, projection: { views: 1 } }
    );
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// ❤️ FAVORITES ROUTES
// ═══════════════════════════════════════════════════════════
app.post('/api/users/:userId/favorites/:promptId', authMiddleware, async (req, res) => {
  try {
    // Verify user is adding to their own favorites
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Cannot modify another user\'s favorites' });
    }

    // Check if prompt exists
    const prompt = await Prompt.exists({ _id: req.params.promptId, status: 'approved' });
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, { $addToSet: { favoritePrompts: req.params.promptId } }, { new: true }
    );
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    res.json({ message: 'Added to favorites', favorites: user.favoritePrompts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/:userId/favorites/:promptId', authMiddleware, async (req, res) => {
  try {
    // Verify user is removing from their own favorites
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Cannot modify another user\'s favorites' });
    }

    // Remove from favorites
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { favoritePrompts: req.params.promptId } },
      { new: true }
    );

    if (!user) return res.status(401).json({ error: 'Invalid token' });
    res.json({ message: 'Removed from favorites', favorites: user.favoritePrompts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:userId/favorites', authMiddleware, async (req, res) => {
  try {
    // Verify user is accessing their own favorites
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Cannot access another user\'s favorites' });
    }

    const user = await User.findById(req.params.userId).populate({ path: 'favoritePrompts', match: { status: 'approved' } });
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    res.json(user.favoritePrompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// 📓 TRAINING JOURNAL ROUTES
// ═══════════════════════════════════════════════════════════
// Every route here scopes to req.user._id from the verified token. The entry
// id / date in the URL is never trusted on its own to identify whose log it is.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Days between two 'YYYY-MM-DD' strings, compared at UTC midnight so the
// arithmetic can't be skewed by the server's local timezone or by DST.
function daysBetween(isoA, isoB) {
  const MS_PER_DAY = 86400000;
  return Math.round((Date.parse(`${isoA}T00:00:00Z`) - Date.parse(`${isoB}T00:00:00Z`)) / MS_PER_DAY);
}

// Longest run of consecutive logged days ending today or yesterday. Yesterday
// still counts so that a streak isn't reported as broken simply because the
// dancer hasn't trained yet today.
function computeStreak(sortedDatesDesc, today) {
  sortedDatesDesc = sortedDatesDesc.filter(date => isCalendarDate(date) && date <= today);
  if (sortedDatesDesc.length === 0) return 0;

  const offset = daysBetween(today, sortedDatesDesc[0]);
  if (offset > 1) return 0;   // most recent entry is older than yesterday

  let streak = 1;
  for (let i = 1; i < sortedDatesDesc.length; i++) {
    if (daysBetween(sortedDatesDesc[i - 1], sortedDatesDesc[i]) !== 1) break;
    streak++;
  }
  return streak;
}

app.get('/api/journal', authMiddleware, async (req, res) => {
  try {
    const page = readPage(req, res, value => typeof value === 'string' && DATE_RE.test(value));
    if (!page) return;
    const filter = { user: req.user._id };
    if (page.after) filter.date = { $lt: page.after };
    const entries = await JournalEntry.find(filter)
      .limit(page.pageSize)
      .populate({ path: 'prompts', select: 'label description', match: { status: 'approved' } })
      .sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Failed to list journal entries:', error);
    res.status(500).json({ error: 'Failed to load journal entries' });
  }
});

// Registered before '/:date' so that 'stats' isn't captured as a date param.
app.get('/api/journal/stats', authMiddleware, async (req, res) => {
  try {
    const { today } = req.query;
    if (!isCalendarDate(today)) {
      return res.status(400).json({ error: 'A `today` query param in YYYY-MM-DD format is required' });
    }

    const entries = await JournalEntry.find({ user: req.user._id })
      .select('date durationMinutes prompts')
      .sort({ date: -1 });

    const uniqueDates = [...new Set(entries.map(e => e.date))];
    const promptCounts = new Map();
    for (const entry of entries) {
      for (const promptId of entry.prompts.filter(Boolean)) {
        const key = promptId.toString();
        promptCounts.set(key, (promptCounts.get(key) || 0) + 1);
      }
    }

    let mostTrained = null;
    if (promptCounts.size > 0) {
      const approved = await Prompt.find({ _id: { $in: [...promptCounts.keys()] }, status: 'approved' }).select('label');
      for (const prompt of approved) {
        const count = promptCounts.get(prompt.id);
        if (!mostTrained || count > mostTrained.count) mostTrained = { label: prompt.label, count };
      }
    }

    res.json({
      totalSessions: entries.length,
      totalMinutes: entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0),
      currentStreak: computeStreak(uniqueDates, today),
      mostTrained
    });
  } catch (error) {
    console.error('Failed to compute journal stats:', error);
    res.status(500).json({ error: 'Failed to load journal stats' });
  }
});

app.get('/api/journal/:date', authMiddleware, async (req, res) => {
  try {
    if (!isCalendarDate(req.params.date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    const entry = await JournalEntry.findOne({ user: req.user._id, date: req.params.date })
      .populate({ path: 'prompts', select: 'label description', match: { status: 'approved' } });
    if (!entry) return res.status(404).json({ error: 'No entry for that date' });

    res.json(entry);
  } catch (error) {
    console.error('Failed to fetch journal entry:', error);
    res.status(500).json({ error: 'Failed to load journal entry' });
  }
});

// Upsert: one entry per dancer per day, so re-logging the same date edits it.
app.post('/api/journal', authMiddleware, async (req, res) => {
  try {
    const { date, prompts, notes, durationMinutes, energy } = req.body ?? {};

    if (!isCalendarDate(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    if ((notes != null && (typeof notes !== 'string' || notes.trim().length > 5000)) ||
        (prompts != null && (!Array.isArray(prompts) || prompts.some(id => !mongoose.isObjectIdOrHexString(id))))) {
      return res.status(400).json({ error: 'Enter valid prompt IDs and notes of at most 5000 characters' });
    }
    if (!notes?.trim() && !(prompts?.length)) {
      return res.status(400).json({ error: 'Add some notes or pick at least one prompt you trained' });
    }
    if (durationMinutes != null && (!Number.isFinite(durationMinutes) || durationMinutes < 0 || durationMinutes > 1440)) {
      return res.status(400).json({ error: 'Duration must be between 0 and 1440 minutes' });
    }
    if (energy != null && (!Number.isInteger(energy) || energy < 1 || energy > 5)) {
      return res.status(400).json({ error: 'Energy must be a whole number from 1 to 5' });
    }

    // Only accept prompt ids that actually exist, so the log can't accumulate
    // dangling references that break the populate on read.
    let promptIds = [];
    if (prompts?.length) {
      const uniqueIds = [...new Set(prompts.map(id => id.toLowerCase()))];
      const found = await Prompt.find({ _id: { $in: uniqueIds }, status: 'approved' }).select('_id');
      if (found.length !== uniqueIds.length) {
        return res.status(400).json({ error: 'One or more selected prompts do not exist' });
      }
      promptIds = found.map(p => p._id);
    }

    const entry = await JournalEntry.findOneAndUpdate(
      { user: req.user._id, date },
      {
        $set: {
          prompts: promptIds,
          notes: notes?.trim() || '',
          durationMinutes: durationMinutes ?? 0,
          ...(energy != null ? { energy } : {}),
          updatedAt: new Date()
        },
        ...(energy == null ? { $unset: { energy: 1 } } : {})
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    ).populate({ path: 'prompts', select: 'label description', match: { status: 'approved' } });

    res.json(entry);
  } catch (error) {
    console.error('Failed to save journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

app.delete('/api/journal/:id', authMiddleware, async (req, res) => {
  try {
    // Scoped by user so one dancer can't delete another's entry by guessing ids.
    const deleted = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });

    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Failed to delete journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// ═══════════════════════════════════════════════════════════
// 📊 ADMIN ROUTES
// ═══════════════════════════════════════════════════════════
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await readStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/prompts/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = readPage(req, res, mongoose.isObjectIdOrHexString);
    if (!page) return;
    const filter = page.after ? { _id: { $lt: page.after } } : {};
    const prompts = await Prompt.find(filter).populate('submittedBy', 'username').sort({ _id: -1 }).limit(page.pageSize);
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// 📈 STATS HELPER
// ═══════════════════════════════════════════════════════════
async function readStats() {
  const [summaries, totalUsers] = await Promise.all([
    Prompt.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalPrompts: { $sum: 1 }, totalViews: { $sum: '$views' }, totalLikes: { $sum: '$likes' } } }
    ]),
    User.countDocuments()
  ]);
  const { totalPrompts = 0, totalViews = 0, totalLikes = 0 } = summaries[0] ?? {};
  return { totalPrompts, totalUsers, totalViews, totalLikes, lastUpdated: new Date() };
}

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  if (status === 500) console.error(error);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : 'Invalid request body' });
});

export { app };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freestyle-dance');
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
