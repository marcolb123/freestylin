# 💃 Freestyle Dance Prompt App 🕺

A React-based web application that helps dancers practice freestyle by providing random prompts, practice tips, video resources, curated practice drills, and music mixes to dance to.

![React](https://img.shields.io/badge/React-19.1.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.2-purple)
![Lucide](https://img.shields.io/badge/Lucide_React-0.553.0-orange)

## 🎨 Tech Stack

- **React 19.1.1** - UI framework
- **Vite 7.1.2** - Build tool and dev server
- **Lucide React** - Icon library
- **CSS3** - Styling with gradients and animations
- **SoundCloud Embeds** - Music integration

## ✨ Features

- 🎲 **Random Prompt Generator** - Spin to get dance prompts like Bounce, Waves, Isolations, Levels, and more
- 💡 **Practice Tips** - Detailed tips for each dance move
- 📺 **Video Resources** - Embedded YouTube tutorials for visual learning
- 🏋️ **Practice Drills** - Curated, specific drills to improve each movement concept
- 🎵 **Music Player** - SoundCloud mixes for House, Krump, Hip-Hop, and Popping
- 🎨 **Modern UI** - Beautiful graffiti-themed background with glassmorphism effects

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd freestyle-prompt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🎯 Usage

1. **Spin a Prompt** - Click "🎲 Spin Prompt" to get a random dance prompt
2. **View Tips** - Click "💡 Tips" to see practice suggestions
3. **Watch Tutorials** - Click "📺 Resources" to view embedded YouTube videos
4. **Practice Drills** - Click "🏋️ Practice Drills" to see curated exercises for that prompt
5. **Choose Music** - Select a genre (House, Krump, Hip-Hop, Popping) to play a SoundCloud mix

## 📁 Project Structure

```
freestyle-prompt/
├── public/
│   └── graffiti-background.png  # Background image
├── src/
│   ├── App.jsx                   # Main React component
│   ├── App.css                   # Component styles
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
└── README.md                     # You are here!
```

## 📊 Dance Prompts Included

1. **Bounce** - Elastic, rhythmic movement with 4 curated drills
2. **Waves** - Fluid body waves through different body parts
3. **Isolations** - Moving individual body parts independently
4. **Levels** - High, mid, low positions and transitions
5. **Textures** - Sharp vs smooth movement contrasts
6. **Footwork** - Step patterns and rhythm variations
7. **Musicality** - Dancing to different layers of music
8. **Floor Work** - Ground-based movement and transitions

Each prompt includes:
- ✅ Detailed description
- ✅ 3-4 practice tips
- ✅ 4 progressive drills
- ✅ YouTube tutorial links

## 🎵 Music Genres

- **House** - Afro Tribal House Mix
- **Krump** - High-energy Krump Mix
- **Hip-Hop** - Old School Hip-Hop Mix
- **Popping** - Funky Popping Mix

## 🛠️ Available Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📝 Adding New Prompts

Edit [`src/App.jsx`](src/App.jsx) and add to the `PROMPTS` array:

```javascript
{
  label: "Your Prompt Name",
  description: "Brief description of the movement",
  tips: [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  drills: [
    "🎯 Drill 1: Description with steps",
    "🔄 Drill 2: Description with steps",
    "⏱️ Drill 3: Description with steps",
    "🎵 Drill 4: Description with steps"
  ],
  links: [
    {
      title: "Tutorial title",
      url: "https://youtube.com/watch?v=..."
    }
  ]
}
```

## 🎨 Customization

### Change Background Image
Replace `public/graffiti-background.png` with your own image

### Add Music Genres
Edit the `MUSIC_GENRES` array in [`src/App.jsx`](src/App.jsx):

```javascript
{
  name: "Genre Name",
  soundCloudUrl: "https://soundcloud.com/...",
  color: "#HexColor"
}
```

## 🙏 Acknowledgments

- YouTube for tutorial embeds
- SoundCloud for music integration
- Lucide React for beautiful icons
- The dance community for inspiration

## 📧 Contact

For questions or feedback, reach out at marcobarot@gmail.com

---

**Happy Dancing!** 💃🕺✨
