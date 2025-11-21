import { useState } from "react";
import "./App.css";
// Import icons from Lucide React
import { 
    Sparkles, 
    Lightbulb, 
    Youtube, 
    Trash2, 
    Music,
    PartyPopper,
    Radio,
    Headphones,
    Dumbbell 
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// 📚 DATA SECTION: All dance prompts with tips and video links
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
            "🎯 Basic Bounce: Stand with feet shoulder-width apart, bend knees slightly, and bounce for 16 counts. Focus on landing softly through the balls of your feet.",
            "🔄 Bounce & Shift: Bounce in place for 8 counts, then shift weight side-to-side while maintaining the bounce for 8 counts.",
            "⏱️ Speed Variation: Bounce at half-time (slow) for 8 counts, then double-time (fast) for 8 counts. Keep the energy consistent.",
            "🎵 Musical Bounce: Practice bouncing on different beats - on the 1, on the 'and', or on the offbeat. This develops musicality.",
        ],
        links: [
            {
                title: "Bounce drills",
                url: "https://www.youtube.com/watch?v=lRbEjAar9yQ",
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
			"💪 Arm Wave Isolated: Practice arm waves slowly - start from wrist, roll through elbow, then shoulder. Do 10 reps each arm.",
			"🌊 Body Wave Flow: Stand with feet together, create a wave from chest down through hips to knees. Repeat 8 times.",
			"🔄 Reverse Wave: Practice the wave in reverse - from knees up through hips, chest, and head. This builds control.",
			"🎭 Mirror Practice: Face a mirror and watch your wave travel. Ensure each body part moves sequentially, not simultaneously.",
		],
		links: [
			{
				title: "Waving concepts",
				url: "https://www.youtube.com/watch?v=GiPk-ekp58w",
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
			"🧠 Head Rolls: Keep shoulders still. Roll head in a circle - front, side, back, side. Do 4 slow circles each direction.",
			"💫 Chest Pops: Isolate chest moving forward and back. Keep hips and shoulders locked. Do 16 reps focusing on clean movement.",
			"🎯 Hip Isolation: Move hips in a square pattern - right, forward, left, back. Keep upper body still. 8 reps each direction.",
			"🔀 Combination Drill: Combine head (4 counts) + chest (4 counts) + hips (4 counts) while keeping other parts frozen. Repeat sequence 4 times.",
		],
		links: [
			{
				title: "Body isolation basics",
				url: "https://www.youtube.com/watch?v=7Caiei_F48s",
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
			"⬆️ High Level Exploration: Dance for 16 counts on your toes, reaching up. Try arm variations and turns.",
			"➡️ Mid Level Flow: Stay in a half-squat position for 16 counts. Move around without standing fully up.",
			"⬇️ Low Level Practice: Get low to the ground. Move for 16 counts using floor work, knee slides, or crawling patterns.",
			"🎢 Level Transitions: Move from high → mid (4 counts), mid → low (4 counts), low → mid (4 counts), mid → high (4 counts). Repeat smoothly.",
		],
		links: [
			{
				title: "Level changes tutorial",
				url: "https://www.youtube.com/shorts/11fj6wGv_7o",
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
			"🤖 Robot Mode: Move in sharp, mechanical angles for 8 counts. Lock each position and move in straight lines only.",
			"💧 Liquid Flow: Switch to smooth, continuous movements for 8 counts. Imagine moving through water.",
			"⚡ Sharp Hits: Hit 4 sharp positions, holding each for 2 counts. Focus on clean stops and tension in the body.",
			"🎭 Texture Switch: Alternate between sharp (4 counts) and smooth (4 counts) for a full 32-count sequence. Make the contrast obvious.",
		],
		links: [
			{
				title: "Textures explained",
				url: "https://www.youtube.com/watch?v=T7o-PT0_Pvg",
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
			"👣 Step-Touch Basic: Step right, touch left. Step left, touch right. Do this for 16 counts, keeping it clean and on beat.",
			"🎵 Rhythm Variation: Add syncopation - step on 1, 'and', 'a', 2. Practice this pattern slowly, then speed up.",
			"🔄 Direction Changes: Do 4 step-touches forward, 4 to the side, 4 backward, 4 to the other side. Keep the pattern consistent.",
			"⚡ Speed Challenge: Start slow (4 counts per step-touch), then gradually double the speed every 8 counts until you're at maximum speed.",
		],
		links: [
			{
				title: "Footwork fundamentals",
				url: "https://www.youtube.com/watch?v=TPClzeTAMhI",
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
			"🎹 Instrument Isolation: Listen to a song. Dance to ONLY the drums for 16 counts, then switch to ONLY the melody for 16 counts.",
			"🎯 Accent Hits: Play a song and freeze/hit every time there's a strong accent or drop. This trains you to catch musical highlights.",
			"⏸️ Pause Practice: Dance and freeze completely when the music has breaks or silence. Resume immediately when music returns.",
			"📊 Dynamics Match: Dance small/soft during quiet parts, big/strong during loud parts. Let your energy mirror the music's intensity.",
		],
		links: [
			{
				title: "Music interpretation",
				url: "https://www.youtube.com/watch?v=BT1i0OEUP6k&t=8s",
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
			"⬇️ Down-Up Flow: Start standing. Get to the floor in 4 counts (any way you want). Get back up in 4 counts. Repeat 8 times.",
			"🔄 Floor Exploration: Spend 32 counts moving ONLY on the floor. Try rolls, spins, crawls - don't stand up.",
			"🌀 Knee Spin Practice: From kneeling position, practice spinning on your knees. Start with 180° turns, then progress to 360°.",
			"🛤️ Pathway Drill: Create a sequence: stand → kneel (4 counts) → sit (4 counts) → lie down (4 counts) → reverse back up. Make it smooth.",
		],
		links: [
			{
				title: "Floor work variations",
				url: "https://www.youtube.com/watch?v=TBr9fPsQfxU",
			},
			{
				title: "Floor work transitions",
				url: "https://www.youtube.com/watch?v=S3LLsWMc2VM",
			}
		],
	},
	
];

// ═══════════════════════════════════════════════════════════
// 🎵 MUSIC GENRES: SoundCloud mixes by genre
// ═══════════════════════════════════════════════════════════
const MUSIC_GENRES = [
    {
        name: "House",
        soundCloudUrl: "https://soundcloud.com/djsupad/housupa-afro-tribal-house-mix",
        color: "#FF6B6B"
    },
    {
        name: "Krump",
        soundCloudUrl: "https://soundcloud.com/merciiful1/krump-mix",
        color: "#4ECDC4"
    },
    {
        name: "Hip-Hop",
        soundCloudUrl: "https://soundcloud.com/kaisalart/old-school-vibes-vol-2-hip-hop-mix",
        color: "#FFE66D"
    },
    {
        name: "Popping",
        soundCloudUrl: "https://soundcloud.com/dj-dbon1-314759770/get-the-tapes-vol-22-hip-hop",
        color: "#95E1D3"
    },
    
    
];

// ═══════════════════════════════════════════════════════════
// 📱 MAIN APP: Wraps everything with title
// ═══════════════════════════════════════════════════════════
export default function App() {
    return (
        <div className="app-container">
            <div className="app-header">
                <h1 className="app-title">
                    <Music className="title-icon" size={48}/> Freestylin <Music className="title-icon" size={48} />
                </h1>
                <p className="app-subtitle">An app to help build dancer's freestyle</p>
            </div>
            
            <div className="app-content">
                <PromptCard />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 🎴 PROMPT CARD COMPONENT: Main interactive card
// ═══════════════════════════════════════════════════════════
function PromptCard() {
    // ─────────────────────────────────────────────────────────
    // 🔄 STATE VARIABLES: Track what's happening in the app
    // ─────────────────────────────────────────────────────────
    const [index, setIndex] = useState(0);
    const [showTips, setShowTips] = useState(false);
    const [showResources, setShowResources] = useState(false);
    const [showDrills, setShowDrills] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const current = PROMPTS[index];

    // ─────────────────────────────────────────────────────────
    // 🎥 YOUTUBE HELPER: Extract video ID from URL (including Shorts)
    // ─────────────────────────────────────────────────────────
    function getYouTubeId(url) {
        // Handle regular YouTube URLs and Shorts
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    }

    // ─────────────────────────────────────────────────────────
    // 🎲 SPIN PROMPT: Get a random prompt
    // ─────────────────────────────────────────────────────────
    function spinPrompt() {
        setShowTips(false);
        setShowResources(false);
        setShowDrills(false);
        const next = Math.floor(Math.random() * PROMPTS.length);
        setIndex(next);
    }


    // ─────────────────────────────────────────────────────────
    // 🎵 SELECT GENRE: Choose music genre
    // ─────────────────────────────────────────────────────────
    function selectGenre(genre) {
        setSelectedGenre(genre);
    }

    // ─────────────────────────────────────────────────────────
    // 🎨 RENDER: What shows on screen
    // ─────────────────────────────────────────────────────────
    return (
        <div className="prompt-card">
            {/* ─────── HEADER ─────── */}
            <div className="card-header">
                <h2 className="prompt-title">{current.label}</h2>
                <p className="prompt-subtitle">
                    <Music className="inline-icon" size={16} /> {current.description}
                </p>
            </div>

            {/* ─────── BUTTONS ─────── */}
            <div className="button-group">
                <button className="btn btn-spin" onClick={spinPrompt}>
                    <Sparkles size={18} /> Spin Prompt
                </button>
                <button
                    className={`btn btn-toggle ${showTips ? "active" : ""}`}
                    onClick={() => setShowTips((s) => !s)}
                >
                    <Lightbulb size={18} /> Tips
                </button>
                <button
                    className={`btn btn-toggle ${showResources ? "active" : ""}`}
                    onClick={() => setShowResources((s) => !s)}
                >
                    <Youtube size={18} /> Resources
                </button>
                <button
                    className={`btn btn-toggle ${showDrills ? "active" : ""}`}
                    onClick={() => setShowDrills((s) => !s)}
                >
                    <Dumbbell size={18} /> Practice Drills
                </button>
            </div>

            {/* ─────── TIPS LIST ─────── */}
            {showTips && (
                <div className="content-box tips-box">
                    <h4>
                        <Lightbulb size={20} /> Practice Tips
                    </h4>
                    <ul>
                        {current.tips.map((t, i) => (
                            <li key={i}>{t}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ─────── VIDEO EMBEDS ─────── */}
            {showResources && (
                <div className="content-box resources-box">
                    <h4>
                        <Youtube size={20} /> Video Resources
                    </h4>
                    {current.links.map((l, i) => {
                        const videoId = getYouTubeId(l.url);
                        return (
                            <div key={i} className="video-container">
                                <h5>{l.title}</h5>
                                {videoId ? (
                                    <iframe
                                        width="100%"
                                        height="315"
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title={l.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <a
                                        href={l.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="video-link"
                                    >
                                        Watch video →
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─────── DRILLS BOX ─────── */}
            {showDrills && (
                <div className="content-box drills-box">
                    <h4>
                        <Dumbbell size={20} /> Practice Drills
                    </h4>
                    <ul>
                        {current.drills.map((drill, i) => (
                            <li key={i}>{drill}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ─────── MUSIC GENRE SELECTOR ─────── */}
            <div className="content-box music-selector">
                <h4 className="music-selector-title">
                    <Headphones size={20} /> Choose Your Music
                </h4>
                <div className="genre-chips">
                    {MUSIC_GENRES.map((genre) => (
                        <button
                            key={genre.name}
                            className={`genre-chip ${selectedGenre?.name === genre.name ? "active" : ""}`}
                            onClick={() => selectGenre(genre)}
                            style={{ 
                                backgroundColor: selectedGenre?.name === genre.name 
                                    ? genre.color 
                                    : 'rgba(255, 255, 255, 0.1)',
                                borderColor: genre.color
                            }}
                        >
                            <Radio size={16} /> {genre.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─────── SOUNDCLOUD PLAYER ─────── */}
            {selectedGenre && (
                <div className="content-box music-box">
                    <h4>
                        <Radio size={20} /> {selectedGenre.name} Mix
                    </h4>
                    <div className="soundcloud-container">
                        <iframe
                            width="100%"
                            height="166"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(selectedGenre.soundCloudUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
