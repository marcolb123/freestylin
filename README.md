#  Freestyle Dance Prompt App

A React-based web application that helps dancers practice freestyle by providing random prompts, practice tips, video resources, curated practice drills, and music mixes to dance to.

![React](https://img.shields.io/badge/React-19.1.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.2-purple)
![Lucide](https://img.shields.io/badge/Lucide_React-0.553.0-orange)

##  Tech Stack

### Frontend
- **React 19.1.1** - UI framework
- **Vite 7.1.2** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **CSS3** - Styling with gradients and animations
- **SoundCloud Embeds** - Music integration

### Backend
- **Node.js & Express** - Server and REST API
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

##  Features

### Core Features
-  **Random Prompt Generator** - Spin to get dance prompts like Bounce, Waves, Isolations, Levels, and more
-  **Practice Tips** - Detailed tips for each dance move
-  **Video Resources** - Embedded YouTube tutorials for visual learning
-  **Practice Drills** - Curated, specific drills to improve each movement concept
-  **Music Player** - SoundCloud mixes for House, Krump, Hip-Hop, and Popping


### New Features (Database-Driven)
-  **MongoDB Integration** - All prompts stored in database
-  **User Authentication** - Login/Register system
-  **Submit Prompts** - Users can submit new prompts for review
-  **Admin Dashboard** - Manage prompts, view stats, approve/reject submissions
-  **Analytics** - Track views, likes, and user engagement


##  Usage

1. **Spin a Prompt** - Click " Spin Prompt" to get a random dance prompt
2. **View Tips** - Click " Tips" to see practice suggestions
3. **Watch Tutorials** - Click " Resources" to view embedded YouTube videos
4. **Practice Drills** - Click " Practice Drills" to see curated exercises for that prompt
5. **Choose Music** - Select a genre (House, Krump, Hip-Hop, Popping) to play a SoundCloud mix

##  Project Structure

```
freestyle-prompt/
├── public/
│   └── graffiti-background.png  # Background image
├── src/
│   ├── App.jsx                   # Main React component with routing
│   ├── App.css                   # Component styles
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── server.js                     # Express backend server
├── seed.js                       # Database seeding script
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── .env                          # Environment variables (create this)
└── README.md                     # You are here!
```

##  Dance Prompts Included

1. **Bounce** - Elastic, rhythmic movement with 4 curated drills
2. **Waves** - Fluid body waves through different body parts
3. **Isolations** - Moving individual body parts independently
4. **Levels** - High, mid, low positions and transitions
5. **Textures** - Sharp vs smooth movement contrasts
6. **Footwork** - Step patterns and rhythm variations
7. **Musicality** - Dancing to different layers of music
8. **Floor Work** - Ground-based movement and transitions

Each prompt includes:
-  Detailed description
-  3-4 practice tips
-  4 progressive drills
- YouTube tutorial links

##  Music Genres

- **House** - Afro Tribal House Mix
- **Krump** - High-energy Krump Mix
- **Hip-Hop** - Old School Hip-Hop Mix
- **Popping** - Funky Popping Mix

##  Database Schema

### Prompt Schema
```javascript
{
  label: String,           // e.g., "Bounce", "Waves"
  description: String,     // Brief description
  tips: [String],          // Array of practice tips
  drills: [{
    icon: String,          // Icon name from Lucide
    text: String           // Drill description
  }],
  links: [{
    title: String,         // Link title
    url: String            // YouTube/resource URL
  }],
  submittedBy: ObjectId,   // User who submitted
  status: String,          // 'pending', 'approved', 'rejected'
  likes: Number,           // Like count
  views: Number,           // View count
  createdAt: Date
}
```

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String,        // Hashed with bcryptjs
  isAdmin: Boolean,
  createdAt: Date
}
```

##  API Endpoints

### Public Endpoints
- `GET /api/prompts` - Get all approved prompts
- `GET /api/prompts?status=pending` - Get prompts by status
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints (Requires JWT)
- `POST /api/prompts` - Submit new prompt
- `PUT /api/prompts/:id` - Update prompt status
- `DELETE /api/prompts/:id` - Delete prompt
- `POST /api/users/:userId/favorites/:promptId` - Add to favorites
- `DELETE /api/users/:userId/favorites/:promptId` - Remove from favorites
- `GET /api/users/:userId/favorites` - Get user's favorites

### Admin Endpoints
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/prompts/all` - Get all prompts (any status)


```

##  Adding New Prompts



###  Through the Web Interface 
- Register/Login to the app
- Click "Submit Prompt" button
- Fill out the form with:
  - Label and description
  - Tips (add multiple)
  - Drills (with icon selection)
  - Resource links (YouTube videos, etc.)
- Submit for admin review
- Admin approves/rejects from the Admin Dashboard


For questions or feedback, reach out at marcobarot@gmail.com

---

**Happy Dancing!** 💃🕺✨
