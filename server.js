// ═══════════════════════════════════════════════════════════
// 🔌 IMPORTS: Load required packages
// ═══════════════════════════════════════════════════════════
import express from 'express';        // Web server framework
import cors from 'cors';              // Allow frontend to talk to backend
import dotenv from 'dotenv';          // Load .env file
import mongoose from 'mongoose';      // MongoDB object modeling
import bcrypt from 'bcryptjs';        // Password hashing
import jwt from 'jsonwebtoken';        // JSON Web Token

dotenv.config();                      // Read .env file

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// ═══════════════════════════════════════════════════════════
// ⚙️ SETUP: Initialize server
// ═══════════════════════════════════════════════════════════
const app = express();

// Configure CORS for production
app.use(cors({
  origin: [
    'http://localhost:5173',                    // Local development
    'http://localhost:5174',                    // Alternative local port
    'https://freestylin.netlify.app',          // UPDATE with your actual Netlify URL (removed trailing slash)
  ],
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

const PromptSchema = new mongoose.Schema({
  label: { type: String, required: true },
  description: { type: String, required: true },
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

// ═══════════════════════════════════════════════════════════
// 🔐 AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
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
app.get('/api/prompts', async (req, res) => {
  try {
    const { search, status, userId } = req.query;
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
    const { label, description, drills, links } = req.body;
    
    // Validate required fields
    if (!label || !description) {
      return res.status(400).json({ error: 'Label and description are required' });
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