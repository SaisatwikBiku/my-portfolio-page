// The Journey map — content and layout for the playable world.
//
// There is no map image any more. The world is generated: src/lib/journeyWorld.js
// grows a coastline, forests, beaches, towns and roads from these coordinates
// and a seeded noise field, and src/lib/journeyPaint.js paints it. That means
// the map inherits the site's theme (light, dark, and Spidey mode all repaint),
// costs one small JS module instead of a multi-megabyte JPEG, and can be tuned
// by moving a number rather than regenerating art.
//
// This file stays deliberately dumb: constants, and the eight chapters. Every
// date and title in PLACES is quoted from the résumé and the internship /
// experience letters, so the map stays factual even though the world is
// stylised.

export const WORLD = { w: 2500, h: 1500 }

// Grid resolution for terrain and collision. 20 world px per cell → 125 × 75.
export const TILE = 20

// Where the walker starts: south of chapter one, on the road spur, far enough
// from every marker that arriving doesn't instantly pop a card open.
export const SPAWN = { x: 300, y: 1400 }

// Trigger radius, in world px, for "you are standing at this place".
export const NEAR_RADIUS = 92

// Radius of the paved town square painted under each chapter.
export const PLAZA_R = 118

export const PLACES = [
  {
    id: 'sri-indu',
    city: 'Hyderabad',
    short: 'Sri Indu College',
    x: 300, y: 1230,
    chapter: '01',
    kind: 'school',
    region: 'in',
    landmark: 'charminar',
    name: 'Sri Indu College of Engineering & Technology',
    org: 'JNTUH',
    role: 'B.Tech, Computer Science & Information Technology',
    period: 'Aug 2020 – Apr 2024',
    place: 'Hyderabad, Telangana, India',
    notes: [
      'Four years of fundamentals — machine learning, AI, compiler construction, computer networks, software engineering, and software testing methodologies.',
      'The final year turned into a first-authored paper: "Program for Emotion-Responsive MIDI Proposal," IJET Volume 11, Issue 3, May 2024, pp. 78–82 — a CNN that reads emotion off a face at ~95.14% accuracy and cues the matching playlist.',
      'Everything on the rest of this map happened *alongside* this degree: three internships and two working stints, all squeezed between semesters.',
    ],
  },
  {
    id: 'study-experts',
    city: 'New Delhi',
    short: 'StudyExperts',
    x: 300, y: 760,
    chapter: '02',
    kind: 'work',
    region: 'in',
    landmark: 'archgate',
    name: 'StudyExperts',
    org: 'Mohan Garden, Uttam Nagar',
    role: 'Programming Content Intern',
    period: 'Jun 2022 – Aug 2022 · 3 months',
    place: 'New Delhi, India',
    notes: [
      'First time being paid to write code — programming tutorials and knowledge-base articles on Python, Java, and data structures, published as self-service resources.',
      'Wrote, ran, and debugged every example before it shipped, because a tutorial that does not compile is worse than no tutorial.',
      'The certificate calls out "coordination skills and communication skills are par excellence" — the lesson that documentation is engineering work stuck.',
    ],
  },
  {
    id: 'rethink-ux',
    city: 'Chandigarh',
    short: 'Rethink UX',
    x: 620, y: 300,
    chapter: '03',
    kind: 'work',
    region: 'in',
    landmark: 'studio',
    name: 'Rethink UX',
    org: 'Sector 37-D',
    role: 'Website Design Intern',
    period: '11 Oct 2022 – 20 Dec 2022',
    place: 'Chandigarh, India',
    notes: [
      'Built client-facing website features in HTML, CSS, and JavaScript, owning assigned modules from requirements through delivery.',
      'Implemented role-based access-control logic so page features unlocked per user role.',
      'First real code reviews with senior engineers — feedback taken and shipped to production standard.',
      'The certificate notes "always been enthusiastic about new learning opportunities" and attendance above 75%.',
    ],
  },
  {
    id: 'real-craft-1',
    city: 'Chandigarh',
    short: 'Real Craft · Ops',
    x: 900, y: 430,
    chapter: '04',
    kind: 'work',
    region: 'in',
    landmark: 'tower',
    name: 'Real Craft Tech',
    org: 'Rethink UX’s parent company',
    role: 'Customer Operations & Marketing Executive',
    period: '16 Mar 2023 – 13 Jul 2023 · 4 months',
    place: 'Chandigarh, India',
    notes: [
      'Invited back to the same company in a different seat — this time on the customer-facing side rather than the build side.',
      'Learning how the thing you ship is actually sold, supported, and explained to the person paying for it.',
      'The letter: "competent and active with sincerity and determination… has proven helpful in the company repeatedly."',
    ],
  },
  {
    id: 'real-craft-2',
    city: 'Chandigarh',
    short: 'Real Craft · EA',
    x: 830, y: 800,
    chapter: '05',
    kind: 'work',
    region: 'in',
    landmark: 'annex',
    name: 'Real Craft Tech',
    org: 'Third stint, same team',
    role: 'Executive Assistant',
    period: '26 Mar 2024 – 30 Jun 2024 · 3 months, 4 days',
    place: 'Chandigarh, India',
    notes: [
      'Final semester of the B.Tech, back at Real Craft Tech for a third time — working directly with the CEO on operations.',
      'Being asked back twice by the same company says more than any single title on this map.',
      'The B.Tech wrapped in April 2024; this stint closed at the end of June, and the visa paperwork was already in motion.',
    ],
  },
  {
    id: 'crossing',
    city: 'Hyderabad → Albany',
    short: 'The Crossing',
    x: 1225, y: 880,
    chapter: '06',
    kind: 'travel',
    region: 'sea',
    landmark: 'signpost',
    name: 'The Crossing',
    org: 'Hyderabad → Albany',
    role: 'One-way ticket',
    period: 'August 2024',
    place: '~8,000 miles / 12,900 km',
    notes: [
      'Two suitcases, a laptop, and a graduate offer from a school on the other side of the planet.',
      'Left behind: a completed degree, five stints across three Indian cities, and a very good idea of what kind of engineer I wanted to be.',
    ],
  },
  {
    id: 'ualbany',
    city: 'Albany, NY',
    short: 'University at Albany',
    x: 1780, y: 640,
    chapter: '07',
    kind: 'school',
    region: 'us',
    landmark: 'campus',
    name: 'University at Albany, SUNY',
    org: 'State University of New York',
    role: 'M.S. Computer Science (Systems) · GPA 3.5',
    period: 'Aug 2024 – May 2026',
    place: 'Albany, New York, USA',
    notes: [
      'Coursework: Database Systems I, Operating Systems, Algorithms & Data Structures, Computer Security, Software Engineering, Artificial Intelligence, Computer Vision, Probability & Computing.',
      'Where the projects on this site were built — the version-controlled resume platform, the tennis-ball tracker, MyDishDB on Google Cloud SQL.',
      'Certified along the way: Building with the Claude API (Anthropic, Mar 2026) and Google AI Essentials (Jul 2026).',
    ],
  },
  {
    id: 'now',
    city: 'Albany, NY',
    short: 'You Are Here',
    x: 2120, y: 330,
    chapter: '08',
    kind: 'now',
    region: 'us',
    landmark: 'home',
    name: 'You Are Here',
    org: 'Albany, NY',
    role: 'Software Engineer — open to work',
    period: '2026 →',
    place: 'Albany, New York, USA',
    notes: [
      'Master’s in hand, full-stack across frontend, backend, and the ML layer, and a habit of ramping fast on whatever the problem needs.',
      'Four cities, five organizations, one very long flight. The next marker on this map has not been placed yet.',
    ],
    cta: true,
  },
]

// The road network, as polylines through the chapters in story order. The first
// entry is the spur from the spawn point, so the player always starts on a path
// that leads somewhere; the `bridge` segment is the one stretch of road that
// runs over open water, and is both painted and collided with differently.
export const ROADS = [
  { pts: [[300, 1400], [300, 1320], [300, 1230]] },
  { pts: [[300, 1230], [250, 1080], [292, 930], [300, 760]] },
  { pts: [[300, 760], [360, 600], [480, 420], [620, 300]] },
  { pts: [[620, 300], [760, 326], [860, 388], [900, 430]] },
  { pts: [[900, 430], [944, 546], [898, 664], [830, 800]] },
  { pts: [[830, 800], [906, 842], [1000, 872]] },
  { pts: [[1000, 872], [1225, 880], [1460, 886]], bridge: true },
  { pts: [[1460, 886], [1596, 802], [1698, 706], [1780, 640]] },
  { pts: [[1780, 640], [1898, 538], [2004, 430], [2120, 330]] },
]
