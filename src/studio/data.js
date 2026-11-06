// An intentionally small first edition. Descriptions and lab exercises are
// Freestylin's own wording; source tutorials remain credited to their teachers.
const howcast = (slug) => `https://howcast.com/videos/${slug}/`;
export const MOVES = [
  {
    id: "two-step",
    name: "Two Step",
    category: "Groove",
    level: "Start here",
    video: "xvmNPLFoDEc",
    teacher: "Howcast · Hip-Hop Dancing",
    source: howcast("505197-how-to-do-the-2-step-hip-hop-dancing"),
    description:
      "A side-to-side step and touch. Use the repeating weight shift as a place to listen, settle and find your own groove.",
    cues: [
      "Transfer your weight before bringing the free foot in.",
      "Let the knees soften with the rhythm.",
      "Keep it small first, then explore travel and upper-body movement.",
    ],
    drill:
      "Stay with the Two Step for eight counts. Repeat it facing a new direction without losing the pulse.",
    color: "yellow",
  },
  {
    id: "running-man",
    name: "Running Man",
    category: "Footwork",
    level: "Build on it",
    video: "CmCVTuKZeQo",
    teacher: "Link & Buddha Stretch · reference demonstration",
    source: "https://dancewithceech.com/blog/hip-hop-dance-move-running-man",
    description:
      "An alternating knee lift and front-to-back foot exchange that creates the feeling of running in place. Begin with the rhythm before increasing the size.",
    cues: [
      "Separate the knee lift from the landing.",
      "Practise both sides at a comfortable tempo.",
      "Keep the upper body involved instead of watching your feet.",
    ],
    drill:
      "Dance eight counts in place, eight travelling sideways, then return to your original groove.",
    color: "blue",
  },
  {
    id: "bart-simpson",
    name: "Bart Simpson",
    category: "Party dance",
    level: "Build on it",
    video: "1yXiUco7gHE",
    teacher: "Howcast · Hip-Hop Dancing",
    source: howcast("505217-how-to-do-the-bart-simpson-hip-hop-dancing"),
    description:
      "A travelling side groove with the arms countering the lower body. Let the directional change become part of the character.",
    cues: [
      "Start by learning the side step without the arms.",
      "Allow the arms to counter the direction of the legs.",
      "Connect each side through a relaxed centre.",
    ],
    drill:
      "Alternate two repetitions to each side. Change the size of the movement while keeping its timing.",
    color: "orange",
  },
  {
    id: "steve-martin",
    name: "Steve Martin",
    category: "Party dance",
    level: "Build on it",
    video: "xgc0jclC2_E",
    teacher: "Howcast · Hip-Hop Dancing",
    source: howcast("505187-how-to-do-the-steve-martin-hip-hop-dancing"),
    description:
      "A walking groove with a downward accent and a change of direction. Use the reference to learn this teaching version, then explore your own pathways.",
    cues: [
      "Feel the down accent through each step.",
      "Give yourself time to rise between accents.",
      "Keep the turn connected to the walking rhythm.",
    ],
    drill:
      "Follow the basic walking phrase, then repeat it along a curved pathway instead of a straight one.",
    color: "yellow",
  },
  {
    id: "smurf",
    name: "Smurf",
    category: "Groove",
    level: "Start here",
    video: "hVlAbEhWKMg",
    teacher: "Howcast · Hip-Hop Dancing",
    source: howcast("505186-how-to-do-the-smurf-hip-hop-dancing"),
    description:
      "A grounded down groove with loose, alternating arm actions. Keep the pulse moving through the whole body.",
    cues: [
      "Find a comfortable stance with soft knees.",
      "Keep the downward accent continuous.",
      "Let the arms stay loose and connected to the groove.",
    ],
    drill:
      "Keep the lower-body rhythm for sixteen counts. Add the arms, then vary their range without changing the pulse.",
    color: "orange",
  },
  {
    id: "roger-rabbit",
    name: "Roger Rabbit",
    category: "Footwork",
    level: "Build on it",
    video: "pua9UszdO24",
    teacher: "Howcast · Hip-Hop Dancing",
    source: howcast("505189-how-to-do-the-roger-rabbit-hip-hop-dancing"),
    description:
      "A springy alternating step with the leg moving behind the body. Start with a compact version so the exchange stays comfortable and clear.",
    cues: [
      "Learn the leg pathway slowly from the reference.",
      "Keep the landing soft.",
      "Relax the arms as the legs exchange.",
    ],
    drill:
      "Practise a short phrase on each side, then enter and exit through a simple Two Step.",
    color: "blue",
  },
  {
    id: "wop",
    name: "The Wop",
    category: "Groove",
    level: "Start here",
    video: "XzmhNJ4ASbg",
    teacher: "Howcast · Hip-Hop Dancing",
    source: howcast("505205-how-to-do-the-wop-hip-hop-dancing"),
    description:
      "A relaxed groove that gives the upper body and arms space to play. Explore how the same rhythm can feel laid-back, playful or heavy.",
    cues: [
      "Establish a steady groove before adding detail.",
      "Keep the shoulders and arms relaxed.",
      "Let the torso respond to the beat.",
    ],
    drill:
      "Repeat the groove for a musical phrase. Make the arms smaller each time while keeping the feeling.",
    color: "yellow",
  },
  {
    id: "cabbage-patch",
    name: "Cabbage Patch",
    category: "Party dance",
    level: "Start here",
    video: "N4STZCPuhf0",
    teacher: "Howcast · Hip-Hop Dancing",
    source: howcast("505207-how-to-do-the-cabbage-patch-hip-hop-dancing"),
    description:
      "A circular arm action carried by a side-to-side groove. Use the whole body to support the circle rather than isolating the arms.",
    cues: [
      "Let your weight move from side to side.",
      "Keep the circle relaxed and comfortable.",
      "Explore a smaller circle before adding more range.",
    ],
    drill:
      "Dance one phrase with a small circle, another with a larger circle, then connect it to a different party dance.",
    color: "blue",
  },
];
export const TRACKS = [
  {
    id: "kick-it",
    title: "Can I Kick It?",
    artist: "A Tribe Called Quest",
    video: "vLfEdehjF4Q",
    style: "Hip-Hop",
    mood: "Laid-back",
    note: "Find a comfortable bounce. Leave space between your ideas.",
    color: "yellow",
  },
  {
    id: "scenario",
    title: "Scenario",
    artist: "A Tribe Called Quest",
    video: "Q6TLWqn82J4",
    style: "Hip-Hop",
    mood: "High energy",
    note: "Play with accents and changes in vocal energy.",
    color: "orange",
  },
  {
    id: "infinity",
    title: "93 ’til Infinity",
    artist: "Souls of Mischief",
    video: "fXJc2NYwHjw",
    style: "Hip-Hop",
    mood: "Laid-back",
    note: "Explore longer phrases and softer transitions.",
    color: "blue",
  },
  {
    id: "mass-appeal",
    title: "Mass Appeal",
    artist: "Gang Starr",
    video: "y9lNbNGbo24",
    style: "Hip-Hop",
    mood: "Grounded",
    note: "Keep returning to the groove underneath the details.",
    color: "yellow",
  },
];
export const LAB_MODES = [
  {
    id: "variation",
    number: "01",
    title: "Flip one move",
    subtitle: "Make the familiar unfamiliar.",
    icon: "variation",
    minMoves: 1,
  },
  {
    id: "connections",
    number: "02",
    title: "Find connections",
    subtitle: "Explore the space between steps.",
    icon: "connections",
    minMoves: 2,
  },
  {
    id: "constraints",
    number: "03",
    title: "Freestyle with a rule",
    subtitle: "Less choice. More discovery.",
    icon: "constraints",
    minMoves: 0,
  },
  {
    id: "rounds",
    number: "04",
    title: "Build practice rounds",
    subtitle: "Give your training a structure.",
    icon: "rounds",
    minMoves: 1,
  },
];
export const MODE_PROMPTS = {
  variation: [
    "Keep the foot pattern. Change only the size for each eight-count.",
    "Keep the rhythm. Explore three different arm pathways.",
    "Make the move travel in a circle, then bring it back to one spot.",
    "Alternate a light and a heavy version every musical phrase.",
  ],
  connections: [
    "Give each movement eight counts, then find a transition that keeps the groove alive.",
    "Move from the first step to the second without returning to a neutral stance.",
    "Use one movement’s ending position as the next movement’s starting point.",
    "Alternate the two movements, changing the length of each phrase.",
  ],
  constraints: [
    "Follow one layer of the music for a phrase, then choose another.",
    "Keep your feet in a small area. Explore texture and upper-body movement.",
    "Leave a deliberate pause between ideas. Keep listening during the pause.",
    "Use only three movement ideas and change how you connect them.",
  ],
  rounds: [
    "Round 1: explore the basic movement. Round 2: vary it. Round 3 and beyond: take it into freestyle.",
    "Begin with a small groove. Add movement vocabulary in the next round. Finish with open freestyle.",
    "Explore one side, explore the other side, then connect both in freestyle.",
  ],
};
