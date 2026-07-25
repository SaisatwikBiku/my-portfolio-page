// The Journey map — an explorable top-down world built around a single
// hand-illustrated background (public/map/world.jpg): one AI-generated map
// image covering the whole journey — Chandigarh, New Delhi, Hyderabad, the
// ocean crossing, and Albany — in one consistent art style, rather than dozens
// of separately-generated landmark pieces that never quite matched each other.
//
// Because the art is a single flat image now, walkability isn't authored as a
// handful of rectangles — it's read directly off the picture. WALKABLE_GRID is
// a coarse (16px-per-cell) land/water mask baked out of the actual pixels of
// world.jpg (see the processing notes below), packed as base64 for size. Land,
// roads, and the pier/stepping-stones crossing all came out walkable
// automatically; only the ocean itself blocks movement.
//
// Every date and title in PLACES is quoted from the résumé and the internship
// / experience letters, so the map stays factual even though the world is
// stylised. Coordinates were placed by eye against the generated map, then
// snapped to the nearest walkable cell.

export const WORLD = { w: 2752, h: 1536 }

// Coarse walkability mask: 172 × 96 cells, 16 world-px each. `bits` is those
// 16,512 cells packed one-bit-per-cell and base64-encoded. Decoded once at
// module load into a Uint8Array so `isWalkable` is an O(1) lookup per corner,
// same cost as the old rect-list scan but accurate to the actual coastline
// instead of a hand-fitted rectangle approximation of it.
const GRID_W = 172
const GRID_H = 96
const GRID_CELL = 16
const GRID_BITS_B64 =
  '////////////HwAAAAAAAAAAAAAA8P///////////wEAAAAAAAAAAAAAAP///////////x8AAAAAAAAAAAAAAPD///////////8BAAAAAAAAAAAAAAD///////////8f+AEAAAAAAAAAAADw////////////gB8AAAAAAAAAAAAA////////////j/8fAAAAAAAAAAAA8P////////////j/BwAAAAAAAAAAAP///////////9///wAAAAAAAAAAAPD//////////////w8AAAAAAAAAAAD///////////////gAAAAAAAAAwB/w////////////fwAAAAAAAAACAPwP/////////////wAAAAAAAAAgAMD/8f///////////x8AAAAAAAAABgD8H/////////////8BAAAAAAAAcDDM//H///////////8/AAAAAAAAgB/D/B//////////////BwAAAAAAAPw53P/x/////////////wAAAAAAAMCf//3//////////////w8AAAAAAAD8//////////////////8AAAAAAADA//////////////////8PAAAAAAAA/P//////////////////AAAAAAAA4P//////////////////DwAAAAAAAP//////////////////fwAAAAAAAP7//////////////////wcAAAAAAPD//////////////////38AAAAAAID///////////////////8/AAAAAAD8////////////////////AwAAAADg////////////////////PwAAAAAA/v///////////////////wMAAAAA4P///////////////////z8AAAAAAP7///////////////////8DAAAAAOD///////////////////8fAAAAAAD+////////////////////AAAAAADg////////////////////DwAAAAAA/////////////////////wEAAAAA+P///////////////////x8AAAAAwP////////////////////8DAAAAAPz///////////////////8/AAAAAOD/////////////////////AwAAAAD+////////////////////fwAAAADw/////////////////////wcAAAAA/////////////////////38AAAAA8P////////////////////8HAAAAAP////////////////////9/AAAAAPD/////////////////////BwAAAAD/////////////////////PwAAAADg/////////////////////wMAAAAA/P///////////////////x8AAAAAwP////////////////////8AAAAAAPz///////////////////8HAAAAAID///////////////////9/AAAAAADw////////////////////AwAAAAAA////////////////////PwAAAAAA8P//nz///////////////wEAAAAAAP7//////////////////x8AAAAAAOD///////////////////8AAAAAIAD///////////////////8XAAAAAILw////////////////////AwAAAHCI/////////3//////////PwAAAIDP///////////3/////////wcAAAD4/f///////99//////////z8AAACA////////////9/////////8DAAAA/P//////////f/////////9/AAAAwP////////////f/////////BwAAAPz//////////3///////////wAAAMD////////////3/////////w8AAAD8//////////9///////////8AAADg////////////9/////////8PAAAA////////////f///////////AAAA8P//////////////////////BwAAgP//////////////////////BwAAAPj/////////////////////DwAAAID//////////z/+////////fwAAAAD4//////////8A/v///////wcAAACA/////////w8AgP///////z8AAAAA+P////////8AAMD///////8DAAwAgP////////8PAAD8//////////8fAPj/////////AADA////////////D/z/////////DwAA/P////////8H/v///////////wAAwP////////8HAP///////////w8AAPj//////09mAAD///////////8AAAD//////z8AAAAA/v////////8PAADA//////8BAAAA4P//////////AAAA+P////8PAAAAAP7/////////DwAAAP////9/AAAAAOD//////////wAAAOD/////BwAAAAD+/////////w8AAAD+////PwAAAABg/v////////8AAADw/////wEAAAAAgP////////8PAAAA/////wMAAAAAAPj/////////AAAA/P///wcAAAAAAID/////////DwAA8P///z8AAAAAAADw/////////wAAAP////8BAAAAAAAA/////////w8AAPj///8HAAAAAAAA8P////////8AAMD///8PAAAAAAAAAP7///////8PAAD+//9/AAAAAAAAAOD/////////'

function decodeGrid(b64, cellCount) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const bits = new Uint8Array(cellCount)
  for (let i = 0; i < cellCount; i++) {
    bits[i] = (bytes[i >> 3] >> (i & 7)) & 1
  }
  return bits
}

const grid = decodeGrid(GRID_BITS_B64, GRID_W * GRID_H)

// True if the world point (x, y) sits on land (or the pier/path network) in
// the generated map, false if it's open water.
export function isWalkable(x, y) {
  const gx = Math.floor(x / GRID_CELL)
  const gy = Math.floor(y / GRID_CELL)
  if (gx < 0 || gy < 0 || gx >= GRID_W || gy >= GRID_H) return false
  return grid[gy * GRID_W + gx] === 1
}

// Where the walker starts: beside the Charminar in Hyderabad, before any of
// this began — close enough to read as "home turf" but far enough from every
// marker that arriving doesn't instantly pop chapter one's card open.
export const SPAWN = { x: 600, y: 1150 }

// Trigger radius, in world px, for "you are standing at this place".
export const NEAR_RADIUS = 90

export const PLACES = [
  {
    id: 'sri-indu',
    city: 'Hyderabad',
    short: 'Sri Indu College · B.Tech',
    x: 190, y: 940,
    chapter: '01',
    kind: 'school',
    name: 'Sri Indu College of Engineering & Technology',
    org: 'JNTUH',
    role: 'B.Tech, Computer Science & Information Technology',
    period: 'Aug 2020 – Apr 2024',
    place: 'Hyderabad, Telangana, India',
    notes: [
      'Four years of fundamentals — machine learning, AI, compiler construction, computer networks, software engineering, and software testing methodologies.',
      'Everything on the rest of this map happened *alongside* this degree: three internships and two working stints, all squeezed between semesters.',
    ],
  },
  {
    id: 'study-experts',
    city: 'New Delhi',
    short: 'StudyExperts',
    x: 490, y: 830,
    chapter: '02',
    kind: 'work',
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
    x: 624, y: 290,
    chapter: '03',
    kind: 'work',
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
    short: 'Real Craft Tech · Ops',
    x: 1000, y: 300,
    chapter: '04',
    kind: 'work',
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
    short: 'Real Craft Tech · EA',
    x: 224, y: 470,
    chapter: '05',
    kind: 'work',
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
    x: 1400, y: 1240,
    chapter: '06',
    kind: 'travel',
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
    x: 2490, y: 750,
    chapter: '07',
    kind: 'school',
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
    x: 2390, y: 420,
    chapter: '08',
    kind: 'now',
    name: 'You Are Here',
    org: 'Albany, NY',
    role: 'Software Engineer — open to work',
    period: '2026 →',
    place: 'Albany, New York, USA',
    notes: [
      'Master’s in hand, full-stack across frontend, backend, and the ML layer, and a habit of ramping fast on whatever the problem needs.',
      'Six cities, four organizations, one very long flight. The next marker on this map has not been placed yet.',
    ],
    cta: true,
  },
]
