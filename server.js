// ═══════════════════════════════════════════════════════════
// 🔌 IMPORTS: Load required packages
// ═══════════════════════════════════════════════════════════
import express from 'express';        // Web server framework
import cors from 'cors';              // Allow frontend to talk to backend
import dotenv from 'dotenv';          // Load .env file
import mongoose from 'mongoose';      // MongoDB object modeling
import bcrypt from 'bcryptjs';        // Password hashing
import jwt from 'jsonwebtoken';        // JSON Web Token
import { STYLES, DEFAULT_STYLE } from './styles.js';

dotenv.config();                      // Read .env file

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// ═══════════════════════════════════════════════════════════
// ⚙️ SETUP: Initialize server
// ═══════════════════════════════════════════════════════════
const app = express();

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
app.use(express.json());              // Parse JSON requests

// ═══════════════════════════════════════════════════════════
// 🗄️ MONGODB CONNECTION
// ═══════════════════════════════════════════════════════════
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freestyle-dance')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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

const PromptSchema = new mongoose.Schema({
  label: { type: String, required: true },
  description: { type: String, required: true },
  // 'Foundation' covers cross-style fundamentals (bounce, waves, musicality)
  // that aren't owned by any single style.
  style: { type: String, enum: STYLES, default: DEFAULT_STYLE },
  tips: [String],
  drills: [{
    icon: String,
    text: String
  }],
  links: [{
    title: String,
    url: String,
    type: { type: String, enum: ['youtube', 'website'], default: 'website' },
    videoId: String  // Extracted YouTube video ID for embeds
  }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

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

const StatSchema = new mongoose.Schema({
  totalPrompts: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Prompt = mongoose.model('Prompt', PromptSchema);
const Stat = mongoose.model('Stat', StatSchema);
const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

// ═══════════════════════════════════════════════════════════
// 🔐 AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    // The token can outlive the account. Without this, req.user is null and
    // every downstream handler (adminMiddleware included) throws a 500 where
    // it should be a clean 401.
    if (!req.user) return res.status(401).json({ error: 'Invalid token' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ═══════════════════════════════════════════════════════════
// 🎥 YOUTUBE HELPER FUNCTION
// ═══════════════════════════════════════════════════════════
function extractYouTubeVideoId(url) {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════
// 🔑 AUTH ROUTES
// ═══════════════════════════════════════════════════════════
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    
    await updateStats();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username, email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// 📝 PROMPT ROUTES
// ═══════════════════════════════════════════════════════════
// Single source of truth for the style list, so the frontend filter can't
// drift out of sync with what the schema actually accepts.
app.get('/api/styles', (req, res) => res.json(STYLES));

app.get('/api/prompts', async (req, res) => {
  try {
    const { search, status, userId, style } = req.query;
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

    if (search) {
      filter.$or = [
        { label: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const prompts = await Prompt.find(filter).populate('submittedBy', 'username');
    
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
      const favoriteIds = user?.favoritePrompts?.map(id => id.toString()) || [];
      
      const promptsWithFavorites = prompts.map(prompt => ({
        ...prompt.toObject(),
        isFavorited: favoriteIds.includes(prompt._id.toString())
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
    const { label, description, drills, links, style } = req.body;

    // Validate required fields
    if (!label || !description) {
      return res.status(400).json({ error: 'Label and description are required' });
    }

    if (style && !STYLES.includes(style)) {
      return res.status(400).json({ error: `Unknown style. Expected one of: ${STYLES.join(', ')}` });
    }
    
    // Validate drills array structure
    if (drills && Array.isArray(drills)) {
      for (const drill of drills) {
        if (!drill.icon || !drill.text) {
          return res.status(400).json({ error: 'Each drill must have an icon and text' });
        }
      }
    }
    
    // Validate and process links array structure
    if (links && Array.isArray(links)) {
      for (const link of links) {
        if (!link.title || !link.url) {
          return res.status(400).json({ error: 'Each link must have a title and url' });
        }
        
        // Validate link type
        if (link.type && !['youtube', 'website'].includes(link.type)) {
          return res.status(400).json({ error: 'Link type must be either "youtube" or "website"' });
        }
        
        // Basic URL validation
        try {
          new URL(link.url);
        } catch {
          return res.status(400).json({ error: `Invalid URL: ${link.url}` });
        }
        
        // Extract YouTube video ID if it's a YouTube link
        if (link.type === 'youtube' || link.url.includes('youtube.com') || link.url.includes('youtu.be')) {
          const videoId = extractYouTubeVideoId(link.url);
          if (videoId) {
            link.videoId = videoId;
            if (!link.type) link.type = 'youtube';
          } else if (link.type === 'youtube') {
            return res.status(400).json({ error: `Invalid YouTube URL: ${link.url}` });
          }
        }
        
        // Default to website if no type specified
        if (!link.type) {
          link.type = 'website';
        }
      }
    }
    
    const prompt = new Prompt({ ...req.body, submittedBy: req.user._id });
    await prompt.save();
    await updateStats();
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/prompts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/prompts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Prompt.findByIdAndDelete(req.params.id);
    await updateStats();
    res.json({ message: 'Prompt deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/prompts/:id/like', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    await updateStats();
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/prompts/:id/view', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    await updateStats();
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
    const prompt = await Prompt.findById(req.params.promptId);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Add to favorites if not already there
    const user = await User.findById(req.params.userId);
    if (!user.favoritePrompts.includes(req.params.promptId)) {
      user.favoritePrompts.push(req.params.promptId);
      await user.save();
    }

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

    const user = await User.findById(req.params.userId).populate('favoritePrompts');
    res.json(user.favoritePrompts || []);
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
    const entries = await JournalEntry.find({ user: req.user._id })
      .populate('prompts', 'label description')
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
    if (!today || !DATE_RE.test(today)) {
      return res.status(400).json({ error: 'A `today` query param in YYYY-MM-DD format is required' });
    }

    const entries = await JournalEntry.find({ user: req.user._id })
      .select('date durationMinutes prompts')
      .sort({ date: -1 });

    const uniqueDates = [...new Set(entries.map(e => e.date))];
    const promptCounts = new Map();
    for (const entry of entries) {
      for (const promptId of entry.prompts) {
        const key = promptId.toString();
        promptCounts.set(key, (promptCounts.get(key) || 0) + 1);
      }
    }

    let mostTrained = null;
    if (promptCounts.size > 0) {
      const [topId, count] = [...promptCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      const prompt = await Prompt.findById(topId).select('label');
      if (prompt) mostTrained = { label: prompt.label, count };
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
    if (!DATE_RE.test(req.params.date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    const entry = await JournalEntry.findOne({ user: req.user._id, date: req.params.date })
      .populate('prompts', 'label description');
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
    const { date, prompts, notes, durationMinutes, energy } = req.body;

    if (!date || !DATE_RE.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
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
      const found = await Prompt.find({ _id: { $in: prompts } }).select('_id');
      if (found.length !== prompts.length) {
        return res.status(400).json({ error: 'One or more selected prompts do not exist' });
      }
      promptIds = found.map(p => p._id);
    }

    const entry = await JournalEntry.findOneAndUpdate(
      { user: req.user._id, date },
      {
        user: req.user._id,
        date,
        prompts: promptIds,
        notes: notes?.trim() || '',
        durationMinutes: durationMinutes || 0,
        ...(energy != null ? { energy } : {}),
        updatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('prompts', 'label description');

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
    let stats = await Stat.findOne();
    if (!stats) {
      stats = await updateStats();
    }
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
    const prompts = await Prompt.find().populate('submittedBy', 'username').sort({ createdAt: -1 });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// 📈 STATS HELPER
// ═══════════════════════════════════════════════════════════
async function updateStats() {
  const totalPrompts = await Prompt.countDocuments({ status: 'approved' });
  const totalUsers = await User.countDocuments();
  
  // Only sum views/likes from approved prompts
  const totalViews = await Prompt.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$views' } } }
  ]);
  const totalLikes = await Prompt.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$likes' } } }
  ]);
  
  return await Stat.findOneAndUpdate(
    {},
    {
      totalPrompts,
      totalUsers,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
}

// ═══════════════════════════════════════════════════════════
// 🚀 START SERVER
// ═══════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));