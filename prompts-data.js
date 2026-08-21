// ═══════════════════════════════════════════════════════════
// 🕺 STREET & CLUB STYLE PROMPTS
// ═══════════════════════════════════════════════════════════
// Prompts grouped by the style they belong to. Kept out of seed.js so the
// seed script stays readable as this list grows.
//
// `icon` values must exist in the iconMap in src/App.jsx, otherwise the drill
// renders without its icon.
//
// Resource links deliberately point at YouTube *searches* rather than specific
// video ids: tutorials get deleted or renamed, and a search always lands the
// dancer somewhere useful instead of on a dead embed.

export const STYLES = ['Hip-Hop', 'Popping', 'Krump', 'House', 'Waacking', 'Breaking', 'Foundation'];

const search = (title, query) => ({
  title,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  type: 'website'
});

export const STYLE_PROMPTS = [
  // ─────────────────────────────────────────────────────────
  // HIP-HOP
  // ─────────────────────────────────────────────────────────
  {
    label: 'Bounce & Rock',
    style: 'Hip-Hop',
    description: 'The engine of hip-hop — a down bounce that drops on the beat, and an up rock that lifts against it',
    tips: [
      'Bounce goes down on the count; rock lifts up on it. Always know which one you are doing.',
      'Power comes from the knees and ankles, not the shoulders.',
      'Keep the chest heavy and relaxed — tension kills the groove.'
    ],
    drills: [
      { icon: 'Target', text: 'Down Bounce: 32 counts dropping into the beat. Land through the whole foot with soft knees. Your head should barely move.' },
      { icon: 'RotateCw', text: 'Up Rock: same tempo, but lift on the count instead of dropping. Feel how the accent flips.' },
      { icon: 'Timer', text: 'Switch between down bounce and up rock every 8 counts without losing tempo.' },
      { icon: 'Music', text: 'Ride one track for a full minute doing nothing but bounce. Boring is the point — the groove has to hold on its own.' }
    ],
    links: [search('Search: hip-hop bounce foundation', 'hip hop dance bounce foundation tutorial')]
  },
  {
    label: 'Party Dances',
    style: 'Hip-Hop',
    description: 'The vocabulary of the culture — Running Man, Roger Rabbit, Cabbage Patch, the Wop and friends',
    tips: [
      'Learn each step clean before you add your own flavour.',
      'Every party dance sits on top of the bounce — keep the bounce underneath it.',
      'Say the name of the dance as you do it. It keeps you honest about the count.'
    ],
    drills: [
      { icon: 'Footprints', text: 'Running Man: 16 slow reps. The pushing foot slides back as the other lifts — both feet move at the same time.' },
      { icon: 'Repeat', text: 'Roger Rabbit: 16 reps. It is the Running Man mirrored — the leg kicks back behind you on the hop.' },
      { icon: 'Combine', text: 'Cabbage Patch and the Wop, 8 counts each, back to back with no pause between them.' },
      { icon: 'Music', text: 'Chain three party dances into a 32-count run. Transition on the count, not between counts.' }
    ],
    links: [search('Search: old school party dances', 'old school hip hop party dances tutorial running man')]
  },
  {
    label: 'Groove & Swagger',
    style: 'Hip-Hop',
    description: 'Weight, texture and attitude — the part that makes it look like you rather than a tutorial',
    tips: [
      'Groove lives in the delay. Arrive a hair behind the beat, not on top of it.',
      'Relax the arms. Stiff arms read as nervous.',
      'Watch social dancing footage, not only choreography. That is where the feel comes from.'
    ],
    drills: [
      { icon: 'RollerCoaster', text: 'Take one 8-count step and do it three ways: heavy and grounded, light and floaty, then sharp and clipped.' },
      { icon: 'Timer', text: 'Dance an 8-count exactly on the beat, then the same one slightly behind it. Feel the change in weight.' },
      { icon: 'Activity', text: 'Freestyle 30 seconds using only upper body groove — no travelling, no footwork.' },
      { icon: 'Brain', text: 'Record 30 seconds and watch it back with the sound off. If the groove still reads, it is working.' }
    ],
    links: [search('Search: hip-hop groove and texture', 'hip hop dance groove texture freestyle tutorial')]
  },

  // ─────────────────────────────────────────────────────────
  // POPPING
  // ─────────────────────────────────────────────────────────
  {
    label: 'Hits & The Fresno',
    style: 'Popping',
    description: 'The foundation of popping — contract and release, walked through the Fresno',
    tips: [
      'A pop is a quick contract and release, not a held flex.',
      'Hit and relax. Holding the tension is the most common beginner mistake.',
      'Start slow. Clean beats fast, every time.'
    ],
    drills: [
      { icon: 'Zap', text: 'Isolated pops: 20 each in chest, arms, neck and legs. One body part at a time, everything else quiet.' },
      { icon: 'Target', text: 'Fresno: step side to side, hitting on each count with the opposite arm extended. 32 counts.' },
      { icon: 'Timer', text: 'Metronome at 80bpm, one pop per beat. Move to 100, then 120, only once every hit lands clean.' },
      { icon: 'Music', text: 'Pop on the snare only, for a whole track. Nothing else.' }
    ],
    links: [search('Search: popping fresno tutorial', 'popping fresno basics tutorial')]
  },
  {
    label: 'Boogaloo Rolls',
    style: 'Popping',
    description: 'Rolling the body in circles — chest rolls, hip rolls and the neck-o-flex',
    tips: [
      'Boogaloo is round where popping is angular. No hits in here.',
      'Isolate the circle to one body part; everything else stays still.',
      'Think of drawing a circle with the body part rather than swinging it.'
    ],
    drills: [
      { icon: 'RotateCw', text: 'Chest rolls: 10 each direction. Keep hips and shoulders out of it.' },
      { icon: 'Circle', text: 'Hip rolls: 10 each direction, knees soft, upper body quiet.' },
      { icon: 'Combine', text: 'Roll the chest, then the hips, then link them into one continuous figure-eight.' },
      { icon: 'Droplet', text: 'Neck-o-flex: slide the head side to side, then add the roll. Go slow — the neck needs warming up.' }
    ],
    links: [search('Search: boogaloo rolls tutorial', 'popping boogaloo chest hip rolls tutorial')]
  },
  {
    label: 'Animation & Dime Stops',
    style: 'Popping',
    description: 'Moving like footage — strobing, dime stops and robot control',
    tips: [
      'A dime stop is a hard stop with no drift. Freeze completely.',
      'Strobing is many small stops inside one movement.',
      'Pick a frame rate and hold to it. Inconsistent stops read as sloppy, not robotic.'
    ],
    drills: [
      { icon: 'Bot', text: 'Robot arm: raise one arm from hip to overhead in 8 distinct stops. Nothing moves between stops.' },
      { icon: 'Timer', text: 'Dime stops: walk forward stopping dead on every count. No wobble on the landing.' },
      { icon: 'Zap', text: 'Strobe one smooth arm circle into 12 visible frames.' },
      { icon: 'Repeat', text: 'Take one gesture and do it three ways: smooth, strobed, then dime-stopped. Notice what each one says.' }
    ],
    links: [search('Search: animation and strobing', 'popping animation strobing dime stop tutorial')]
  },

  // ─────────────────────────────────────────────────────────
  // KRUMP
  // ─────────────────────────────────────────────────────────
  {
    label: 'The Four Elements',
    style: 'Krump',
    description: 'Jabs, arm swings, chest pops and stomps — the raw vocabulary of krump',
    tips: [
      'Krump is powerful but controlled. Power without control is just flailing.',
      'Ground yourself before you go big — the stomp anchors everything.',
      'Breathe out on the hit. Holding your breath tightens you up.'
    ],
    drills: [
      { icon: 'Zap', text: 'Jabs: 20 sharp arm jabs, retracting fully each time. The retraction is half the move.' },
      { icon: 'Activity', text: 'Arm swings: 20 full swings from the shoulder, letting the torso follow the weight.' },
      { icon: 'Target', text: 'Chest pops: 20 pops isolating the chest. Shoulders stay down.' },
      { icon: 'Footprints', text: 'Stomps: 16 alternating stomps, driving down through the floor.' }
    ],
    links: [search('Search: krump fundamentals', 'krump fundamentals jabs arm swings chest pops stomps')]
  },
  {
    label: 'Buck Hops & Power',
    style: 'Krump',
    description: 'Travelling with force — hops, kill offs, and learning to build energy instead of spending it all at once',
    tips: [
      'Buck is intensity, not speed. You can be buck slowly.',
      'Land loaded, ready for the next move.',
      'Energy builds in waves. You cannot hold maximum for a whole round.'
    ],
    drills: [
      { icon: 'ArrowUp', text: 'Buck hops: 16 travelling hops, chest leading, arms driving.' },
      { icon: 'TrendingUp', text: 'Build a 30-second run from calm to full power. Do not peak in the first five seconds.' },
      { icon: 'Combine', text: 'Chain stomp into chest pop into arm swing into jab as one phrase. 10 reps.' },
      { icon: 'RollerCoaster', text: 'Run that same phrase at 40%, then 70%, then 100% power. Keep the shape identical at every level.' }
    ],
    links: [search('Search: krump buck hops', 'krump buck hops power tutorial')]
  },
  {
    label: 'Character & Labbing',
    style: 'Krump',
    description: 'Finding your krump character and building it deliberately in the lab',
    tips: [
      'Krump is expressive — the movement carries a mood or a story.',
      'Labbing is deliberate practice, not just going hard.',
      'Your character should be recognisable from across the room.'
    ],
    drills: [
      { icon: 'Brain', text: 'Pick one emotion. Freestyle 30 seconds expressing only that.' },
      { icon: 'Repeat', text: 'Take a single move and find 10 variations of it. Same move, ten personalities.' },
      { icon: 'Activity', text: 'Kill off: build a 4-count phrase that ends on a hard piece of punctuation.' },
      { icon: 'Music', text: 'Freestyle to a track with no drops in it. Create your own dynamics.' }
    ],
    links: [search('Search: krump labbing and character', 'krump labbing character development')]
  },

  // ─────────────────────────────────────────────────────────
  // HOUSE
  // ─────────────────────────────────────────────────────────
  {
    label: 'The Jack',
    style: 'House',
    description: 'The pulse that runs through house — a wave through the torso riding the four-to-the-floor',
    tips: [
      'The jack is a contraction and release through the spine, not a bounce in the knees.',
      'House sits around 120–130bpm. Let the kick drum drive it.',
      'Stay light. House lifts up rather than sitting down.'
    ],
    drills: [
      { icon: 'WavesIcon', text: 'Jack in place: 32 counts, feeling the pulse travel from chest to hips.' },
      { icon: 'Timer', text: 'Jack on every count, then on every half count. Keep it clean at double time.' },
      { icon: 'Music', text: 'Put on a house track and jack through the entire intro. Nothing else.' },
      { icon: 'Combine', text: 'Jack while stepping side to side — the pulse has to survive the travel.' }
    ],
    links: [search('Search: house dance jack tutorial', 'house dance the jack tutorial')]
  },
  {
    label: 'House Footwork',
    style: 'House',
    description: 'Shuffles, heel-toes and loose legs — fast feet underneath a calm upper body',
    tips: [
      'Feet fast, upper body relaxed. The contrast is the whole look.',
      'Learn each step slowly. Speed comes from cleanliness, not effort.',
      'Stay on the balls of your feet.'
    ],
    drills: [
      { icon: 'Footprints', text: 'Shuffle: 32 counts of the basic shuffle, staying light.' },
      { icon: 'RouteIcon', text: 'Heel-toe: 16 counts each side, articulating heel then toe.' },
      { icon: 'Repeat', text: 'Loose legs: 32 counts letting the lower leg swing freely from the knee.' },
      { icon: 'Combine', text: 'Link shuffle into heel-toe into loose legs as a 24-count run without stopping.' }
    ],
    links: [search('Search: house footwork basics', 'house dance footwork shuffle heel toe tutorial')]
  },
  {
    label: 'Lofting & Floor',
    style: 'House',
    description: 'Dropping into the floor and rising back into the groove without breaking the pulse',
    tips: [
      'Get down and back up without losing the music.',
      'Use your hands to catch weight, not to slap the floor.',
      'The transition matters more than the floor move itself.'
    ],
    drills: [
      { icon: 'ArrowDown', text: 'Practise only the drop: standing to floor, 10 times, slow and controlled.' },
      { icon: 'ArrowUp', text: 'Practise only the rise: floor to standing, 10 times, landing on the beat.' },
      { icon: 'Circle', text: 'Floor sweep: 8 counts circling one leg along the ground.' },
      { icon: 'Combine', text: 'Jack 8 counts, loft down over 4, rise over 4, then back into footwork. Keep the music underneath.' }
    ],
    links: [search('Search: house lofting tutorial', 'house dance lofting floor work tutorial')]
  },

  // ─────────────────────────────────────────────────────────
  // WAACKING
  // ─────────────────────────────────────────────────────────
  {
    label: 'Arm Whips & Rotations',
    style: 'Waacking',
    description: 'Whipping the arms from the shoulder socket — fast, rotational, and stopped clean',
    tips: [
      'The rotation comes from the shoulder, not the elbow or the wrist.',
      'Whip out and stop. The stop is what makes it read.',
      'Keep the shoulder down. Hiking it up shortens the line.'
    ],
    drills: [
      { icon: 'RotateCw', text: 'Shoulder circles: 20 each direction, arm straight, tracing a full circle.' },
      { icon: 'Zap', text: 'Whip and stop: 20 whips, freezing at the end of each one. No drift.' },
      { icon: 'Repeat', text: 'Alternating arms: 32 counts, one arm whipping while the other holds a pose.' },
      { icon: 'Combine', text: 'Two whips into a pose, 10 times. The pose is the punctuation.' }
    ],
    links: [search('Search: waacking arm technique', 'waacking arms rotation technique tutorial')]
  },
  {
    label: 'Posing & Punchlines',
    style: 'Waacking',
    description: 'Hitting the music with shapes — in waacking the pose is the point, not the pause',
    tips: [
      'A pose is a full stop. Commit to it completely.',
      'Find the accent in the music and land the pose exactly on it.',
      'Change your levels. Not every pose is standing tall.'
    ],
    drills: [
      { icon: 'Target', text: 'Pose on every 8: freestyle 8 counts and hit a pose on the 1. Repeat 8 times.' },
      { icon: 'ArrowDown', text: 'Take one pose and find it at three levels: high, mid, and on the floor.' },
      { icon: 'Music', text: 'Play a disco track and mark every accent with a different pose.' },
      { icon: 'Timer', text: 'Hold each pose for a full 4 counts. Learn to be still.' }
    ],
    links: [search('Search: waacking posing', 'waacking posing musicality tutorial')]
  },
  {
    label: 'Walks, Struts & Attitude',
    style: 'Waacking',
    description: 'Travelling with presence — the runway between the poses is part of the dance',
    tips: [
      'Waacking came out of the clubs. Perform it, do not just execute it.',
      'The walk is part of the dance, not a gap between moves.',
      'Eyes up and out. Where you look directs the audience.'
    ],
    drills: [
      { icon: 'Footprints', text: 'Strut 8 counts across the floor and hit a pose on the last count.' },
      { icon: 'Activity', text: 'Walk a circle for 16 counts holding one continuous attitude.' },
      { icon: 'Brain', text: 'Pick a character and cross the floor as them. Three crossings, three characters.' },
      { icon: 'Combine', text: 'Strut 8, whip 4, pose 4. Repeat it travelling in a square.' }
    ],
    links: [search('Search: waacking walks and posing', 'waacking walks struts performance tutorial')]
  },

  // ─────────────────────────────────────────────────────────
  // BREAKING
  // ─────────────────────────────────────────────────────────
  {
    label: 'Toprock',
    style: 'Breaking',
    description: 'Standing footwork — where the round opens and your character shows first',
    tips: [
      'Toprock is your introduction. Do not rush past it to get to the floor.',
      'Keep the rock in the upper body; it is not only steps.',
      'Stay on the music — toprock is where your musicality is most visible.'
    ],
    drills: [
      { icon: 'Footprints', text: 'Indian step: 32 counts, arms crossing opposite to the legs.' },
      { icon: 'RouteIcon', text: 'Salsa step: 32 counts, shifting weight cleanly on each step.' },
      { icon: 'Repeat', text: 'Front step: 16 counts on each side.' },
      { icon: 'Combine', text: 'Chain three toprock steps into a 24-count run, then repeat it travelling.' }
    ],
    links: [search('Search: toprock basics', 'breaking toprock basics tutorial indian step')]
  },
  {
    label: 'Footwork & The 6-Step',
    style: 'Breaking',
    description: 'Ground footwork circling around your hands — the engine of the round',
    tips: [
      'Weight lives in your hands. Learn to shift onto them early.',
      'Keep the hips low. Rising up makes everything harder.',
      'The 6-step is a circle. Always know which way you are facing.'
    ],
    drills: [
      { icon: 'Circle', text: '6-step: 10 slow rotations, counting each step out loud.' },
      { icon: 'Repeat', text: '3-step: 10 rotations in each direction.' },
      { icon: 'Dumbbell', text: 'Hand weight: hold a plank and shift weight side to side for 30 seconds.' },
      { icon: 'Timer', text: '6-step to a metronome, one step per beat, raising the tempo gradually.' }
    ],
    links: [search('Search: 6-step tutorial', 'breaking 6 step footwork tutorial')]
  },
  {
    label: 'Freezes & Go-Downs',
    style: 'Breaking',
    description: 'Dropping into the floor and locking a shape that holds',
    tips: [
      'A freeze is a hard stop with the weight fully supported. Find the balance point.',
      'Go-downs should flow out of toprock rather than interrupt it.',
      'Build wrist and shoulder strength before chasing the harder freezes.'
    ],
    drills: [
      { icon: 'ArrowDown', text: 'Go-down drill: toprock 8 counts then drop into footwork. 10 times.' },
      { icon: 'Target', text: 'Baby freeze: hold for 10 seconds on both sides. Elbow into the hip, head as the third point of contact.' },
      { icon: 'Dumbbell', text: 'Conditioning: 3 sets of 20-second handstand holds against a wall.' },
      { icon: 'Combine', text: 'Toprock 8, go down, 6-step, freeze. Run it as one continuous phrase.' }
    ],
    links: [search('Search: baby freeze tutorial', 'breaking baby freeze tutorial beginner')]
  }
];
