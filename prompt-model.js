import mongoose from 'mongoose';
import { STYLES, DEFAULT_STYLE } from './styles.js';

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

PromptSchema.index({ status: 1, _id: 1 });

export const Prompt = mongoose.model('Prompt', PromptSchema);
