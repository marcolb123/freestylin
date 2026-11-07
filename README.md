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

### Training Journal
-  **Daily Log** - Record what you trained each day: which prompts, how long, how it felt, and freeform notes
-  **Streaks** - Consecutive-day training streak, so momentum is visible
-  **Stats** - Total sessions, total training time, and your most-trained prompt
-  **Log This Session** - Jump straight from a prompt you just practiced into the journal with it pre-selected
-  **One Entry Per Day** - Re-logging the same date edits that day's entry instead of creating duplicates


##  Usage

1. **Choose a Style** - Pick Hip-Hop, Popping, Krump, House, Waacking, Breaking or Foundation to train one style, or leave it on "All Styles"
2. **Spin a Prompt** - Click " Spin Prompt" to get a random prompt from the style you selected
3. **View Tips** - Click " Tips" to see practice suggestions
4. **Watch Tutorials** - Click " Resources" to view tutorials for that prompt
5. **Practice Drills** - Click " Practice Drills" to see curated exercises for that prompt
6. **Choose Music** - Select a genre (House, Krump, Hip-Hop, Popping) to play a SoundCloud mix. Picking a matching style cues this automatically
7. **Log the Session** - Click " Log This Session" to record it in your training journal

### Seeding prompts

```bash
npm run seed
```

Re-running is safe: existing prompts are left alone, and any that predate the
style field get categorised as "Foundation". Pass `--yes` to skip the
confirmation prompt in a non-interactive shell (CI, scripts):

```bash
npm run seed -- --yes
```

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

Prompts are grouped by street and club style. Use the **Choose Your Style**
filter on the home page to spin within one style, or leave it on **All Styles**
to draw from everything. Picking a style also cues the matching music mix where
one exists.

### Hip-Hop
1. **Bounce & Rock** - The down bounce and the up rock, the engine of the style
2. **Party Dances** - Running Man, Roger Rabbit, Cabbage Patch, the Wop
3. **Groove & Swagger** - Weight, texture and attitude

### Popping
4. **Hits & The Fresno** - Contract and release, walked through the Fresno
5. **Boogaloo Rolls** - Chest rolls, hip rolls, neck-o-flex
6. **Animation & Dime Stops** - Strobing, dime stops, robot control

### Krump
7. **The Four Elements** - Jabs, arm swings, chest pops, stomps
8. **Buck Hops & Power** - Travelling with force, building energy in waves
9. **Character & Labbing** - Finding your krump character deliberately

### House
10. **The Jack** - The pulse through the torso on the four-to-the-floor
11. **House Footwork** - Shuffles, heel-toes, loose legs
12. **Lofting & Floor** - Dropping in and rising without losing the pulse

### Waacking
13. **Arm Whips & Rotations** - Rotational arms from the shoulder socket
14. **Posing & Punchlines** - Hitting the accents with shapes
15. **Walks, Struts & Attitude** - Travelling with presence

### Breaking
16. **Toprock** - Where the round opens
17. **Footwork & The 6-Step** - Ground footwork around your hands
18. **Freezes & Go-Downs** - Dropping in and locking a shape

### Foundation
Cross-style fundamentals that belong to no single style: **Bounce**, **Waves**,
**Isolations**, **Levels**, **Textures**, **Footwork**, **Musicality**,
**Floor Work**.

Each prompt includes:
-  A style tag
-  Detailed description
-  3-4 practice tips
-  4 progressive drills
-  Resource links

##  Music Genres

- **House** - Afro Tribal House Mix
- **Krump** - High-energy Krump Mix
- **Hip-Hop** - Old School Hip-Hop Mix
- **Popping** - Funky Popping Mix

##  Database Schema

### Prompt Schema
```javascript
{
  style: String,           // 'Hip-Hop' | 'Popping' | 'Krump' | 'House'
                           // | 'Waacking' | 'Breaking' | 'Foundation'
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

### Journal Entry Schema
```javascript
{
  user: ObjectId,          // Owner (always taken from the JWT, never the URL)
  date: String,            // 'YYYY-MM-DD' in the dancer's own timezone
  prompts: [ObjectId],     // Which prompts were trained
  notes: String,           // Freeform reflection
  durationMinutes: Number, // 0-1440
  energy: Number,          // 1-5, optional
  createdAt: Date,
  updatedAt: Date
}
```
`date` is a string rather than a `Date` on purpose: it anchors an entry to the
dancer's own calendar day. Storing a timestamp would let an evening session in a
negative-offset timezone roll over into tomorrow and break the streak count.
A unique index on `(user, date)` enforces one entry per dancer per day.

##  API Endpoints

### Public Endpoints
- `GET /api/prompts` - Get all approved prompts
- `GET /api/prompts?style=Breaking` - Get approved prompts for one style
- `GET /api/styles` - List the valid style names
- `GET /api/prompts?status=pending` - Get prompts by status (admin token required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints (Requires JWT)
- `POST /api/prompts` - Submit new prompt
- `PUT /api/prompts/:id` - Update prompt status
- `DELETE /api/prompts/:id` - Delete prompt
- `POST /api/users/:userId/favorites/:promptId` - Add to favorites
- `DELETE /api/users/:userId/favorites/:promptId` - Remove from favorites
- `GET /api/users/:userId/favorites` - Get user's favorites

### Journal Endpoints (Requires JWT, scoped to the logged-in user)
- `GET /api/journal` - List your journal entries, newest first
- `GET /api/journal/stats?today=YYYY-MM-DD` - Streak, total sessions, total minutes, most-trained prompt
- `GET /api/journal/:date` - Get your entry for one date (`YYYY-MM-DD`)
- `POST /api/journal` - Create or update your entry for a date
- `DELETE /api/journal/:id` - Delete one of your entries

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
