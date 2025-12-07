// ═══════════════════════════════════════════════════════════
// 🔌 IMPORTS: Load required packages
// ═══════════════════════════════════════════════════════════
import express from 'express';        // Web server framework
import OpenAI from 'openai';          // ChatGPT API
import cors from 'cors';              // Allow frontend to talk to backend
import dotenv from 'dotenv';          // Load .env file
import mongoose from 'mongoose';      // MongoDB object modeling
import bcrypt from 'bcryptjs';        // Password hashing
import jwt from 'jsonwebtoken';        // JSON Web Token

dotenv.config();                      // Read .env file

// ═══════════════════════════════════════════════════════════
// ⚙️ SETUP: Initialize server and AI
// ═══════════════════════════════════════════════════════════
const app = express();
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY  // Get API key from .env
});

app.use(cors());                      // Enable CORS
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
  createdAt: { type: Date, default: Date.now }
});

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
    url: String
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

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
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');
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
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');
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
    const { search, status } = req.query;
    const filter = status ? { status } : { status: 'approved' };
    
    if (search) {
      filter.$or = [
        { label: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const prompts = await Prompt.find(filter).populate('submittedBy', 'username');
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prompts', authMiddleware, async (req, res) => {
  try {
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

// ═══════════════════════════════════════════════════════════
// 🤖 AI ROUTES (existing)
// ═══════════════════════════════════════════════════════════
app.post('/api/dance-advice', async (req, res) => {
  try {
    const { prompt } = req.body;      // Get prompt name from frontend
    
    // Ask ChatGPT for advice
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional dance instructor specializing in freestyle dance."
        },
        {
          role: "user",
          content: `Give me specific advice for practicing "${prompt}" in freestyle dance. Keep it under 100 words.`
        }
      ], 
      max_tokens: 150
    });

    // Send AI's response back to frontend
    res.json({ advice: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get AI advice' });
  }
});

app.post('/api/create-drills', async (req, res) => {
  try {
    const { prompt } = req.body;      // Get prompt name from frontend
    
    // Ask ChatGPT to create practice drills
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional dance instructor specializing in freestyle dance. Create structured, progressive practice drills."
        },
        {
          role: "user",
          content: `Create 1 practice drills for "${prompt}" in freestyle dance. Format each drill with:
          - Drill name
          - Duration/repetitions
          - Step-by-step instructions
          Present the drills in a clear, easy-to-follow list.`
        }
      ], 
      max_tokens: 300
    });

    // Send AI's response back to frontend
    res.json({ drills: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create drills' });
  }
});

// ═══════════════════════════════════════════════════════════
// 📈 STATS HELPER
// ═══════════════════════════════════════════════════════════
async function updateStats() {
  const totalPrompts = await Prompt.countDocuments({ status: 'approved' });
  const totalUsers = await User.countDocuments();
  const totalViews = await Prompt.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
  const totalLikes = await Prompt.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }]);
  
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
const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));