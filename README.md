# 💃 Freestyle Dance Prompt App 🕺
<img width="2967" height="1636" alt="image" src="https://github.com/user-attachments/assets/4330bce9-3403-4bdf-a01b-7d62a62c6844" />


A React-based web application that helps dancers practice freestyle by providing random prompts, tips, video resources, and AI-powered dance advice.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Vite](https://img.shields.io/badge/Vite-6.0.1-purple)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green)

## 🎨 Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Vite 6.0.1** - Build tool and dev server
- **CSS3** - Styling with gradients and animations

### Backend
- **Express** - Web server framework
- **OpenAI API** - GPT-4o-mini for AI advice
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management


## ✨ Features

- 🎲 **Random Prompt Generator** - Spin to get dance prompts like Bounce, Waves, Groove, Isolations, and more
- 💡 **Practice Tips** - Detailed tips for each dance move
- 📺 **Video Resources** - Embedded YouTube tutorials for visual learning
- 🤖 **AI Dance Coach** - Get personalized advice from GPT-4o-mini for each prompt
- 📜 **Session History** - Track your last 5 practice prompts with timestamps
- 💾 **Persistent Storage** - History saved in browser localStorage
- 🎨 **Modern UI** - Beautiful gradient design with glassmorphism effects

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

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

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Start the development servers**

   **Option A: Run both servers separately**
   
   Terminal 1 (Backend):
   ```bash
   node server.js
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

   **Option B: Run both servers at once**
   ```bash
   npm run dev:full
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🎯 Usage

1. **Spin a Prompt** - Click the "🎲 Spin Prompt" button to get a random dance prompt
2. **View Tips** - Click "💡 Tips" to see practice suggestions
3. **Watch Tutorials** - Click "📺 Resources" to view embedded YouTube videos
4. **Ask AI** - Click "🤖 Ask AI" to get personalized advice from ChatGPT
5. **Track History** - Your recent prompts are automatically saved at the bottom

## 📁 Project Structure

```
freestyle-prompt/
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Styled components
│   ├── min.jsx         # React entry point
│   └── index.css        # Global styles
├── server.js            # Express backend for AI API
├── .env                 # Environment variables (not in git)
├── package.json         # Dependencies and scripts
└── README.md           # You are here!
```

## 📊 Dance Prompts Included

1. **Bounce** - Elastic, rhythmic movement
2. **Waves** - Fluid body waves
3. **Groove** - Finding your base rhythm
4. **Isolations** - Moving individual body parts
5. **Levels** - High, mid, low positions
6. **Textures** - Sharp vs smooth movement
7. **Footwork** - Step patterns and variations
8. **Musicality** - Dancing to the music
9. **Floor Work** - Ground-based movement
10. **Freestyle** - Pure improvisation

## 💰 API Costs

Using **GPT-4o-mini**:
- **Per request**: ~$0.00008 (0.008 cents)
- **100 requests**: ~$0.008 (less than 1 cent)
- **1,000 requests**: ~$0.08 (8 cents)
- **With $10 credit**: ~125,000 requests (years of use!)

## 🛠️ Available Scripts

```bash
npm run dev          # Start frontend dev server
npm run server       # Start backend server
npm run dev:full     # Start both servers at once
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔒 Security Notes

- ⚠️ Never commit `.env` file to git
- ✅ `.env` is already in `.gitignore`
- 🔑 Keep your API keys secret
- 🚀 For production, use environment variables on your hosting platform

## 📝 Adding New Prompts

Edit `src/App.jsx` and add to the `PROMPTS` array:

```javascript
{
  label: "Your Prompt Name",
  tips: [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  links: [
    {
      title: "Tutorial title",
      url: "https://youtube.com/watch?v=..."
    }
  ]
}
```



## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini API
- YouTube for tutorial embeds
- The dance community for inspiration

## 📧 Contact

For questions or feedback, reach out at marcobarot@gmail.com

---

**Happy Dancing!** 💃🕺✨
