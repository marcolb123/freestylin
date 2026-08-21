// ═══════════════════════════════════════════════════════════
// 🌱 DATABASE SEED SCRIPT
// ═══════════════════════════════════════════════════════════
// This script populates the MongoDB database with initial prompts.
// Run this script ONCE after setting up your database.
//
// Usage: npm run seed
//
// ⚠️ WARNING: This script will add prompts to your database.
// If prompts already exist, they will not be duplicated (based on label).
// ═══════════════════════════════════════════════════════════

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { STYLE_PROMPTS } from './prompts-data.js';

dotenv.config();

// Pass --yes to skip the "prompts already exist" confirmation, so the script
// can run in CI or any other non-interactive shell without hanging on stdin.
const AUTO_YES = process.argv.includes('--yes') || process.argv.includes('-y');

// ═══════════════════════════════════════════════════════════
// 📊 MONGODB SCHEMA (same as in server.js)
// ═══════════════════════════════════════════════════════════
const PromptSchema = new mongoose.Schema({
  label: { type: String, required: true },
  description: { type: String, required: true },
  style: {
    type: String,
    enum: ['Hip-Hop', 'Popping', 'Krump', 'House', 'Waacking', 'Breaking', 'Foundation'],
    default: 'Foundation'
  },
  tips: [String],
  drills: [{
    icon: String,
    text: String
  }],
  links: [{
    title: String,
    url: String,
    type: { type: String, enum: ['youtube', 'website'], default: 'website' },
    videoId: String
  }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Prompt = mongoose.model('Prompt', PromptSchema);

// ═══════════════════════════════════════════════════════════
// 📚 PROMPTS DATA (extracted from App.jsx)
// ═══════════════════════════════════════════════════════════
const PROMPTS = [
    {
        label: "Bounce",
        description: "Elastic, rhythmic movement with spring in your knees and ankles",
        tips: [
            "Keep knees soft; think elastic ankles.",
            "Let head/shoulders ride the bounce.",
            "Lock to the downbeat for 8 counts.",
        ],
        drills: [
            { icon: "Target", text: "Basic Bounce: Stand with feet shoulder-width apart, bend knees slightly, and bounce for 16 counts. Focus on landing softly through the balls of your feet." },
            { icon: "RotateCw", text: "Bounce & Shift: Bounce in place for 8 counts, then shift weight side-to-side while maintaining the bounce for 8 counts." },
            { icon: "Timer", text: "Speed Variation: Bounce at half-time (slow) for 8 counts, then double-time (fast) for 8 counts. Keep the energy consistent." },
            { icon: "Music", text: "Musical Bounce: Practice bouncing on different beats - on the 1, on the 'and', or on the offbeat. This develops musicality." },
        ],
        links: [
            {
                title: "Bounce drills",
                url: "https://www.youtube.com/watch?v=lRbEjAar9yQ",
                type: "youtube",
                videoId: "lRbEjAar9yQ"
            },
        ],
    },
    {
        label: "Waves",
        description: "body waves that flow through different body parts such as your arms, chest, and hips",
        tips: [
            "Wrist → elbow → shoulder → chest.",
            "Lead with fingertips; imagine water.",
            "Practice both directions with breath.",
        ],
        drills: [
            { icon: "Dumbbell", text: "Arm Wave Isolated: Practice arm waves slowly - start from wrist, roll through elbow, then shoulder. Do 10 reps each arm." },
            { icon: "WavesIcon", text: "Body Wave Flow: Stand with feet together, create a wave from chest down through hips to knees. Repeat 8 times." },
            { icon: "RotateCw", text: "Reverse Wave: Practice the wave in reverse - from knees up through hips, chest, and head. This builds control." },
            { icon: "Activity", text: "Mirror Practice: Face a mirror and watch your wave travel. Ensure each body part moves sequentially, not simultaneously." },
        ],
        links: [
            {
                title: "Waving concepts",
                url: "https://www.youtube.com/watch?v=GiPk-ekp58w",
                type: "youtube",
                videoId: "GiPk-ekp58w"
            },
        ],
    },
    {
        label: "Isolations",
        description: "Moving individual body parts independently while keeping others still",
        tips: [
            "Move one body part while keeping others still.",
            "Start with head, chest, or hips.",
            "Use mirror to check clean movement.",
        ],
        drills: [
            { icon: "Brain", text: "Head Rolls: Keep shoulders still. Roll head in a circle - front, side, back, side. Do 4 slow circles each direction." },
            { icon: "Zap", text: "Chest Pops: Isolate chest moving forward and back. Keep hips and shoulders locked. Do 16 reps focusing on clean movement." },
            { icon: "Target", text: "Hip Isolation: Move hips in a square pattern - right, forward, left, back. Keep upper body still. 8 reps each direction." },
            { icon: "Combine", text: "Combination Drill: Combine head (4 counts) + chest (4 counts) + hips (4 counts) while keeping other parts frozen. Repeat sequence 4 times." },
        ],
        links: [
            {
                title: "Body isolation basics",
                url: "https://www.youtube.com/watch?v=7Caiei_F48s",
                type: "youtube",
                videoId: "7Caiei_F48s"
            },
        ],
    },
    {
        label: "Levels",
        description: "Exploring high, mid, and low positions with smooth transitions",
        tips: [
            "Explore high, mid, and low positions.",
            "Transition smoothly between levels.",
            "Challenge: spend 16 counts at each level.",
        ],
        drills: [
            { icon: "ArrowUp", text: "High Level Exploration: Dance for 16 counts on your toes, reaching up. Try arm variations and turns." },
            { icon: "ArrowRight", text: "Mid Level Flow: Stay in a half-squat position for 16 counts. Move around without standing fully up." },
            { icon: "ArrowDown", text: "Low Level Practice: Get low to the ground. Move for 16 counts using floor work, knee slides, or crawling patterns." },
            { icon: "RollerCoaster", text: "Level Transitions: Move from high → mid (4 counts), mid → low (4 counts), low → mid (4 counts), mid → high (4 counts). Repeat smoothly." },
        ],
        links: [
            {
                title: "Level changes tutorial",
                url: "https://www.youtube.com/shorts/11fj6wGv_7o",
                type: "youtube",
                videoId: "11fj6wGv_7o"
            },
        ],
    },
    {
        label: "Textures",
        description: "Contrasting sharp, robotic movements with smooth, liquid flows",
        tips: [
            "Mix sharp hits with smooth flows.",
            "Contrast robotic and liquid movements.",
            "Match texture to music dynamics.",
        ],
        drills: [
            { icon: "Bot", text: "Robot Mode: Move in sharp, mechanical angles for 8 counts. Lock each position and move in straight lines only." },
            { icon: "Droplet", text: "Liquid Flow: Switch to smooth, continuous movements for 8 counts. Imagine moving through water." },
            { icon: "Zap", text: "Sharp Hits: Hit 4 sharp positions, holding each for 2 counts. Focus on clean stops and tension in the body." },
            { icon: "Activity", text: "Texture Switch: Alternate between sharp (4 counts) and smooth (4 counts) for a full 32-count sequence. Make the contrast obvious." },
        ],
        links: [
            {
                title: "Textures explained",
                url: "https://www.youtube.com/watch?v=T7o-PT0_Pvg",
                type: "youtube",
                videoId: "T7o-PT0_Pvg"
            },
        ],
    },
    {
        label: "Footwork",
        description: "Step patterns and variations",
        tips: [
            "Start simple: step-touch, kick-step.",
            "Keep weight on balls of feet.",
            "Add rhythm variations to basic steps. such as 1 an a 2 an 3 4",
        ],
        drills: [
            { icon: "Footprints", text: "Step-Touch Basic: Step right, touch left. Step left, touch right. Do this for 16 counts, keeping it clean and on beat." },
            { icon: "Music", text: "Rhythm Variation: Add syncopation - step on 1, 'and', 'a', 2. Practice this pattern slowly, then speed up." },
            { icon: "RotateCw", text: "Direction Changes: Do 4 step-touches forward, 4 to the side, 4 backward, 4 to the other side. Keep the pattern consistent." },
            { icon: "Zap", text: "Speed Challenge: Start slow (4 counts per step-touch), then gradually double the speed every 8 counts until you're at maximum speed." },
        ],
        links: [
            {
                title: "Footwork fundamentals",
                url: "https://www.youtube.com/watch?v=TPClzeTAMhI",
                type: "youtube",
                videoId: "TPClzeTAMhI"
            },
        ],
    },
    {
        label: "Musicality",
        description: "Dancing to different layers of music with intention and dynamics",
        tips: [
            "Hit accents and breaks in the music.",
            "Dance to different instruments/layers.",
            "Pause when the music pauses.",
        ],
        drills: [
            { icon: "Music", text: "Instrument Isolation: Listen to a song. Dance to ONLY the drums for 16 counts, then switch to ONLY the melody for 16 counts." },
            { icon: "Target", text: "Accent Hits: Play a song and freeze/hit every time there's a strong accent or drop. This trains you to catch musical highlights." },
            { icon: "Circle", text: "Pause Practice: Dance and freeze completely when the music has breaks or silence. Resume immediately when music returns." },
            { icon: "TrendingUp", text: "Dynamics Match: Dance small/soft during quiet parts, big/strong during loud parts. Let your energy mirror the music's intensity." },
        ],
        links: [
            {
                title: "Music interpretation",
                url: "https://www.youtube.com/watch?v=BT1i0OEUP6k&t=8s",
                type: "youtube",
                videoId: "BT1i0OEUP6k"
            },
        ],
    },
    {
        label: "Floor Work",
        description: "Ground-based movement including spins, rolls, and smooth transitions",
        tips: [
            "Practice getting down and up smoothly.",
            "Use hands for support and transitions.",
            "Try and explore pathways from the standing to knee to lying down positions.",
        ],
        drills: [
            { icon: "ArrowDown", text: "Down-Up Flow: Start standing. Get to the floor in 4 counts (any way you want). Get back up in 4 counts. Repeat 8 times." },
            { icon: "RotateCw", text: "Floor Exploration: Spend 32 counts moving ONLY on the floor. Try rolls, spins, crawls - don't stand up." },
            { icon: "Repeat", text: "Knee Spin Practice: From kneeling position, practice spinning on your knees. Start with 180° turns, then progress to 360°." },
            { icon: "RouteIcon", text: "Pathway Drill: Create a sequence: stand → kneel (4 counts) → sit (4 counts) → lie down (4 counts) → reverse back up. Make it smooth." },
        ],
        links: [
            {
                title: "Floor work variations",
                url: "https://www.youtube.com/watch?v=TBr9fPsQfxU",
                type: "youtube",
                videoId: "TBr9fPsQfxU"
            },
            {
                title: "Floor work transitions",
                url: "https://www.youtube.com/watch?v=S3LLsWMc2VM",
                type: "youtube",
                videoId: "S3LLsWMc2VM"
            }
        ],
    },
];

// ═══════════════════════════════════════════════════════════
// 🚀 SEED FUNCTION
// ═══════════════════════════════════════════════════════════
async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freestyle-dance');
    console.log('✅ MongoDB connected');

    // Check if prompts already exist
    const existingCount = await Prompt.countDocuments({ status: 'approved' });
    if (existingCount > 0 && !AUTO_YES) {
      console.log(`⚠️  Database already contains ${existingCount} approved prompt(s).`);
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to continue and add more prompts? (y/n): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Seeding cancelled');
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    // Existing prompts predate the `style` field, so give them one before the
    // style filter starts hiding anything that isn't categorised.
    const backfilled = await Prompt.updateMany(
      { $or: [{ style: { $exists: false } }, { style: null }] },
      { $set: { style: 'Foundation' } }
    );
    if (backfilled.modifiedCount > 0) {
      console.log(`🏷️  Backfilled ${backfilled.modifiedCount} existing prompt(s) as "Foundation"`);
    }

    // The original prompts are cross-style fundamentals; the new ones carry
    // their own style.
    const ALL_PROMPTS = [
      ...PROMPTS.map(p => ({ ...p, style: p.style || 'Foundation' })),
      ...STYLE_PROMPTS
    ];

    // Insert prompts
    console.log('🌱 Seeding prompts...');
    let addedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const promptData of ALL_PROMPTS) {
      // Check if prompt with this label already exists
      const existing = await Prompt.findOne({ label: promptData.label });
      
      if (existing) {
        // Don't overwrite an existing prompt's content, but do correct its
        // style so a re-run re-categorises prompts seeded before styles existed.
        if (promptData.style && existing.style !== promptData.style) {
          existing.style = promptData.style;
          await existing.save();
          console.log(`🏷️  Re-styled "${promptData.label}" as ${promptData.style}`);
          updatedCount++;
        } else {
          console.log(`⏭️  Skipping "${promptData.label}" (already exists)`);
          skippedCount++;
        }
      } else {
        await Prompt.create({
          ...promptData,
          status: 'approved',  // All seeded prompts are pre-approved
          likes: 0,
          views: 0
        });
        console.log(`✅ Added "${promptData.label}" (${promptData.style})`);
        addedCount++;
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Added: ${addedCount} prompt(s)`);
    console.log(`   🏷️  Re-styled: ${updatedCount} prompt(s)`);
    console.log(`   ⏭️  Skipped: ${skippedCount} prompt(s) (already existed)`);
    console.log(`   📦 Total in database: ${await Prompt.countDocuments()}`);

    const byStyle = await Prompt.aggregate([
      { $group: { _id: '$style', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('\n🕺 Prompts by style:');
    for (const row of byStyle) {
      console.log(`   ${row._id || 'uncategorised'}: ${row.count}`);
    }
    console.log('\n🎉 Seeding complete!');

    await mongoose.disconnect();
    console.log('👋 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
