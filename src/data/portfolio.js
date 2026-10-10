// Centralized content for the portfolio — sourced from the latest resume.

const ICON = (name) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}.svg`

// Site / brand identity.
export const site = {
  domain: 'satwik.info',
  url: 'https://satwik.info',
}

export const profile = {
  name: 'Sai Satwik Bikumandla',
  shortName: 'Sai Satwik',
  role: 'Software Engineer',
  typedRoles: [
    'Full-Stack Developer',
    'ML / Computer Vision Engineer',
    'Backend Developer',
  ],
  tagline:
    'Software Engineer with full-stack knowledge, building production-grade software applications with AI/ML capabilities.',
  location: 'Albany, NY',
  email: 'bikumandlasaisatwik@gmail.com',
  phone: '+1 518 614 1904',
  resume: '/Sai_Satwik_Bikumandla_Resume.pdf',
}

export const socials = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/saisatwikbk',
    icon: ICON('linkedin/linkedin-original'),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/SaisatwikBiku',
    icon: ICON('github/github-original'),
  },
]

// Tech badges that float around the hero photo.
export const heroBadges = [
  { name: 'React', icon: ICON('react/react-original') },
  { name: 'Python', icon: ICON('python/python-original') },
  { name: 'TensorFlow', icon: ICON('tensorflow/tensorflow-original') },
]

export const about = {
  paragraphs: [
    "I'm a software engineer and Master's student in Computer Science at the University at Albany (SUNY), based in Albany, NY. I build production-grade systems end to end — comfortable across the frontend, backend, and machine-learning layers of a product.",
    "I've shipped a version-controlled resume platform with a dual-render LaTeX pipeline, a real-time tennis ball detection and tracking system, and a cloud-secured relational database on Google Cloud SQL. The computer-vision thread goes back further — my final-year undergrad research on emotion-responsive music was peer-reviewed and published in IJET in 2024, with me as first author. I'm driven by project-based learning and turning fuzzy, real-world problems into software people can actually use.",
  ],
  highlights: [
    { value: '6+', label: 'Shipped Projects' },
    { value: '3', label: 'Layers: FE · BE · ML' },
    { value: '1', label: 'Peer-Reviewed Paper' },
    { value: '2026', label: 'MS CS Graduation' },
  ],
}

// Skills mirror the resume's categories. Chips with an `icon` render the logo;
// conceptual skills (no logo) render as text-only pills.
export const skillGroups = [
  {
    title: 'Languages',
    skills: [
      { name: 'Python', icon: ICON('python/python-original') },
      { name: 'JavaScript', icon: ICON('javascript/javascript-original') },
      { name: 'TypeScript', icon: ICON('typescript/typescript-original') },
      { name: 'Java', icon: ICON('java/java-original') },
      { name: 'C++', icon: ICON('cplusplus/cplusplus-original') },
    ],
  },
  {
    title: 'Frameworks & Backend',
    skills: [
      { name: 'React', icon: ICON('react/react-original') },
      { name: 'Next.js', icon: ICON('nextjs/nextjs-original') },
      { name: 'Node.js', icon: ICON('nodejs/nodejs-original') },
      { name: 'Flask', icon: ICON('flask/flask-original') },
    ],
  },
  {
    title: 'ML & Vision',
    skills: [
      { name: 'TensorFlow', icon: ICON('tensorflow/tensorflow-original') },
      { name: 'Keras', icon: ICON('keras/keras-original') },
      { name: 'OpenCV', icon: ICON('opencv/opencv-original') },
      { name: 'NumPy', icon: ICON('numpy/numpy-original') },
      { name: 'Pandas', icon: ICON('pandas/pandas-original') },
    ],
  },
  {
    title: 'Databases & Cloud',
    skills: [
      { name: 'MongoDB', icon: ICON('mongodb/mongodb-original') },
      { name: 'MySQL', icon: ICON('mysql/mysql-original') },
      { name: 'Google Cloud', icon: ICON('googlecloud/googlecloud-original') },
      { name: 'AWS', icon: ICON('amazonwebservices/amazonwebservices-original-wordmark') },
    ],
  },
  {
    title: 'DevOps & Architecture',
    skills: [
      { name: 'Docker', icon: ICON('docker/docker-original') },
      { name: 'Kubernetes', icon: ICON('kubernetes/kubernetes-original') },
      { name: 'CI/CD' },
      { name: 'Microservices' },
      { name: 'System Design' },
      { name: 'API Design' },
    ],
  },
  {
    title: 'Web Design & Frontend',
    skills: [
      { name: 'Figma', icon: ICON('figma/figma-original') },
      { name: 'HTML5', icon: ICON('html5/html5-original') },
      { name: 'CSS3', icon: ICON('css3/css3-original') },
      { name: 'UI/UX Design' },
      { name: 'Responsive Design' },
      { name: 'Accessibility (WCAG)' },
    ],
  },
  {
    title: 'Tools & Practices',
    skills: [
      { name: 'Git', icon: ICON('git/git-original') },
      { name: 'LaTeX', icon: ICON('latex/latex-original') },
      { name: 'MATLAB', icon: ICON('matlab/matlab-original') },
      { name: 'REST APIs' },
      { name: 'Unit Testing' },
      { name: 'Agile/Scrum' },
    ],
  },
]

export const certifications = [
  { name: 'Building AI Agents: Advanced Techniques for Developers', issuer: 'Linkedin Learning', date: 'August 2026' },
  { name: 'Google AI Essentials', issuer: 'Google', date: 'July 2026' },
  { name: 'Building with the Claude API', issuer: 'Anthropic', date: 'March 2026' },
]

export const projects = [
  {
    title: 'Job Agent',
    subtitle: 'Self-Hosted AI Job Search Assistant',
    year: '2026',
    category: 'ML & AI',
    description:
      'A job-search assistant running on a spare laptop with local LLMs and no cloud APIs. Every night it reads ~13,000 postings from ~140 company career boards, scores them against my resume, and prepares tailored applications: answers, resume and cover letter. I approve each one from a web panel on my phone; only then does a browser script fill and submit the real form.',
    tags: ['Python', 'FastAPI', 'Ollama', 'Qwen3', 'JavaScript', 'Linux'],
    page: '/work/job-agent',
    href: 'https://github.com/SaisatwikBiku/job-agent',
  },
  {
    title: 'MarkVid - Bookmark Videos for Later',
    subtitle: 'Video Bookmarking Chrome Extension',
    year: '2026',
    category: 'Frontend',
    description:
      'A Chrome extension that lets users bookmark videos for later viewing, with a clean and intuitive interface. Built with JavaScript, it leverages the Chrome Extension APIs for seamless integration with the browser.',
    tags: ['JavaScript', 'Chrome Extension'],
    href: 'https://chromewebstore.google.com/detail/kikihaeleljdfmejdhphjmbefflejpod?utm_source=item-share-cb'
  },
  {
    title: 'LaTeX Resume Builder',
    subtitle: 'Version-Controlled Resume Platform',
    year: '2025',
    category: 'Full-Stack',
    description:
      'A full-stack SaaS-style app giving job seekers a GitHub-inspired resume workflow: named repositories, commit snapshots, full version history, and rollback to any prior state. A dual-render pipeline pairs an HTML live preview for zero-latency editing with a server-side LaTeX endpoint that exports print-ready PDFs from any historical commit.',
    tags: ['Next.js', 'MongoDB', 'NextAuth', 'LaTeX'],
    href: 'https://github.com/SaisatwikBiku/latex-resume-builder',
  },
  {
    title: 'Movie Recommendation System',
    subtitle: 'Content-Based NLP Engine',
    year: '2025',
    category: 'ML & AI',
    description:
      'A content-based recommender over 5,000+ films using TF-IDF vectorization and cosine similarity, with a full NLP preprocessing pipeline (tokenization, lemmatization, stop-word removal). Evaluated relevance with Precision@K (K = 5, 10, 20) for data-driven threshold tuning over a random baseline.',
    tags: ['TF-IDF', 'NLP', 'scikit-learn', 'Python'],
    href: 'https://github.com/SaisatwikBiku/movie-recommender-v2',
  },
  {
    title: 'Tennis Ball Detection & Tracking',
    subtitle: 'Real-Time Computer Vision Pipeline',
    year: '2025',
    category: 'ML & AI',
    description:
      'Two production-quality tracking systems built on Roboflow\'s detection API: anti-jump filtering, exponential smoothing, velocity extrapolation, court-side A/B classification, and SORT multi-object tracking with per-track trajectory trails. A TrackingAnalytics engine exports structured per-session JSON, all wrapped in an interactive Gradio UI.',
    tags: ['Roboflow', 'SORT', 'Gradio', 'Computer Vision'],
    private: true,
  },
  {
    title: 'Next-Word Predictor',
    subtitle: 'LSTM Language Model',
    year: '2025',
    category: 'ML & AI',
    description:
      'An LSTM language model (Embedding → LSTM 150 → Softmax) trained in TensorFlow/Keras on a 20,000-token corpus of IMDB reviews. Built the full data pipeline — tokenization, sliding-window sequencing, padding, one-hot encoding — with checkpoint-based persistence for instant reloads.',
    tags: ['TensorFlow', 'Keras', 'LSTM', 'NLP'],
    href: 'https://github.com/SaisatwikBiku/next_word_prediction',
  },
  {
    title: 'MyDishDB',
    subtitle: 'Cloud-Deployed Relational Database',
    year: '2025',
    category: 'Data & Cloud',
    description:
      'A fully normalized MySQL schema (E-R → DDL) spanning 10+ entities with CHECK constraints, triggers, and referential integrity. Deployed on Google Cloud SQL with role-based access control and a JWT-authenticated backend, optimized with indexed multi-table JOINs.',
    tags: ['MySQL', 'Google Cloud SQL', 'JWT', 'Schema Design'],
    private: true,
  },
  {
    title: 'Web Prototype Generator',
    subtitle: 'AI-Assisted Code Generation',
    year: '2024',
    category: 'Full-Stack',
    description:
      'Led the Gemini API integration layer, building a prompt-engineering pipeline that converts natural-language client briefs into responsive HTML/CSS/JS prototypes with auto-embedded Unsplash imagery. Backend service layer built with Flask; introduced AI-attribution tagging standards adopted across the team codebase.',
    tags: ['Gemini API', 'Flask', 'Prompt Engineering'],
    href: 'https://github.com/SaisatwikBiku/prototype-generator-for-web-dev',
  },
]

// Case study for the Job Agent project (/work/job-agent). Screenshots are the
// real panel running on made-up data; nothing from my own search is shown.
const JA = '/projects/job-agent/'
export const jobAgent = {
  title: 'Job Agent',
  lead: 'A self-hosted AI assistant for the job search, running on a spare laptop with no cloud APIs.',
  href: 'https://github.com/SaisatwikBiku/job-agent',
  hero: {
    src: `${JA}home.jpg`,
    alt: 'The Job Agent home screen: items that need attention, applications ready to review, a seven-day chart and the nightly search status',
    caption: 'The home screen. All data in these screenshots is made up.',
  },
  metrics: [
    { value: '~13,000', label: 'postings read per night' },
    { value: '~140', label: 'company career boards' },
    { value: '0', label: 'cloud AI APIs' },
    { value: '1 tap', label: 'to approve each application' },
  ],
  sections: [
    {
      heading: 'The problem',
      text: 'Applying well takes time: finding roles that actually fit, answering the same form questions again and again, tailoring a resume and cover letter, and then keeping track of every reply. Mass-apply bots save time by spraying low-quality applications. I wanted the opposite: the machine does the preparation, and I make every decision.',
    },
    {
      heading: 'What it does',
      points: [
        'Finds jobs from the public board APIs of Greenhouse, Lever, Ashby, Workday and SmartRecruiters, plus four staffing agencies, and discovers new companies through a local search engine.',
        'A local 4B model extracts each posting’s required skills and level into a fixed JSON schema; the match score is then computed in code, so it’s consistent and explainable.',
        'Prepares each strong match overnight: answers from a profile I fill in once, drafted answers to open questions, a two-page tailored resume in my own words and a cover letter, with unsupported claims flagged. An “Additional” skills line adds the posting’s exact terms for skills my resume already shows, because applicant tracking systems match words as written; it never adds a skill I don’t have.',
        'Checks every application against employers’ hiring rules first: duplicates, per-company caps, cooldowns after rejections, graduation windows and AI-use policies.',
        'I review each one in the panel and approve with one key or a swipe. Only approved applications are filled and submitted, by a userscript in my own browser, and an exact copy of what was sent is kept.',
        'Reads a dedicated inbox (read-only) to track confirmations, assessments, interviews and rejections, including applications I send myself outside the agent, and writes a weekly report with the numbers behind every suggestion.',
        'Auto mode learns from my own approve and skip decisions which jobs I always pass on and skips them for me, holds jobs past my three-roles-in-30-days company cap until they can go out, and sends a to-do list at 6 p.m. It never approves, submits or sends anything.',
        'Looks after its own hardware: a heat guard pauses AI work if the CPU stays at 90°C for a minute, a Cool down button pauses it on demand, and charger, battery, disk and downtime alerts reach my phone.',
      ],
    },
    {
      heading: 'How it’s built',
      points: [
        'Python and FastAPI on Ubuntu Server, on a laptop with an Intel Core i3 and 16 GB of RAM. Qwen3 4B and 8B run on the CPU through Ollama.',
        'Benchmarks drove the design: CPU-bound generation made prompt size the main cost, so prompts are short and stable for Ollama’s cache. A 1,011-token step went from ~30 s of prompt processing to 1.7 s.',
        'A keyboard-first web panel in plain HTML, CSS and JavaScript, styled like a Mission: Impossible HUD: three panes on a laptop, stacked on a phone, one key per decision, and ETag caching so unchanged lists cost a 304.',
        'Deploys itself: a systemd timer pulls from GitHub, checks syntax, backs up the running version and rolls back automatically if the health check fails.',
      ],
    },
    {
      heading: 'Secure by design',
      points: [
        'Human in the loop: the model’s output never becomes a command, a URL or a submission without my approval.',
        'Least privilege: the panel and the tools run as separate Unix users joined by a single sudo rule, and a firewall rule keeps the tool user from approving its own actions.',
        'Private by default: the panel is only reachable over my Tailscale network, email text goes to a model with no tools, and links in emails are never opened.',
        'Plays by the rules: it reads public board APIs, checks robots.txt, and leaves out sites whose terms forbid automated access.',
      ],
    },
  ],
  gallery: [
    { src: `${JA}jobs-decide.jpg`, alt: 'Reviewing an application with answers, consents, tailored documents and an Approve button', caption: 'Reviewing an application: answers to check, consents to tick, tailored resume and cover letter.' },
    { src: `${JA}applications.jpg`, alt: 'An application timeline from approval to interview request', caption: 'Every application keeps a timeline and an exact copy of what was sent.' },
    { src: `${JA}insights.jpg`, alt: 'Weekly report with suggestions and a jobs-per-day chart', caption: 'The weekly report. No model writes it; every suggestion shows its numbers.' },
    { src: `${JA}inbox.jpg`, alt: 'Inbox with an assessment and a live deadline countdown', caption: 'Replies sorted by a local model, with live deadline countdowns.' },
    { src: `${JA}auto.jpg`, alt: 'Auto mode settings: what it learned from my decisions and the patterns it skips on its own', caption: 'Auto mode: what it learned from my decisions, and the kinds of job it now skips for me.' },
    { src: `${JA}heat.jpg`, alt: 'The nightly search card with the CPU temperature and a Cool down button', caption: 'The nightly search, with the CPU temperature and a Cool down button.' },
  ],
  phones: [
    { src: `${JA}phone-home.jpg`, alt: 'Home screen on a phone' },
    { src: `${JA}phone-review.jpg`, alt: 'Reviewing an application on a phone' },
  ],
  phonesNote: 'On a phone the same app stacks: a bottom tab bar, and each job opens full screen with Approve and Skip, or a swipe.',
  tags: ['Python', 'FastAPI', 'Ollama', 'Qwen3', 'JavaScript', 'Linux', 'systemd', 'Tailscale', 'IMAP'],
  note: 'Personal details, my job search and server addresses are kept out of the public code; the screenshots use invented data.',
  incident: {
    to: '/work/job-agent/incident',
    title: 'Incident report: the day it ran hot',
    text: 'An overheating alert on a hike, a shutdown from my phone, and what I changed. October 3, 2026.',
  },
}

// Incident report for the job agent, 2026-10-03. Every time, number and log line here is
// from the server's own records (systemd journal, sar, Ollama timings) or from the
// controlled test run that evening. The screenshots are the real ones from my phone, with
// my wallpaper, email, profile photo and network addresses blurred.
const JAI = '/projects/job-agent/incident/'
export const jobAgentIncident = {
  title: 'The day it ran hot',
  lead: 'Incident report, Saturday October 3, 2026: an overheating alert on a mountain, two shutdowns, and what I changed.',
  date: 'October 3, 2026',
  summary:
    'I was hiking Sleeping Beauty Mountain when my phone said the server was at 95°C. I shut it down over SSH from the trail. Back home, the logs showed it had been idle for hours: one 32-second AI request had pushed the CPU into its normal turbo burst, and the alert fired on that single spike. Then I shut it down a second time by pressing the power button to wake the screen. Nothing was lost, and the agent now caps its bursts, pauses itself when it stays hot, and logs everything it sends.',
  metrics: [
    { value: '95°C', label: 'peak that set off the alert' },
    { value: '32 s', label: 'the burst that caused it' },
    { value: '18 min', label: 'from alert to remote shutdown' },
    { value: '25 W', label: 'new burst cap (was 51–55 W)' },
  ],
  timeline: [
    { time: '1:00 am', text: 'The nightly search runs as usual until 3:14. The CPU sits at 63–74% for twenty minutes, then 25%. No problem.' },
    { time: '3–5 pm', text: 'The server is idle, 99.8% of the CPU free. I’m on the trail.' },
    { time: '5:05 pm', text: 'A new email arrives and the local 4B model reads it: 32 seconds of prompt processing on all eight threads, right after the model reloaded.' },
    { time: '5:06 pm', text: 'My phone: “Server running hot. CPU at 95°C. Check that its vents aren’t blocked.”' },
    { time: '5:10 pm', text: 'I switch Auto mode off, hoping to make the agent stop working.' },
    { time: '5:11 pm', text: 'I ask the panel’s assistant to “stop all tasks and give the CPU rest.” Answering means more model work. It lists /proc, then asks permission to run sudo shutdown now. Nothing runs without my approval, and I don’t give it.' },
    { time: '5:24 pm', text: 'I SSH in from my iPhone over Tailscale and run sudo poweroff. Tailscale shows the server offline.' },
    { time: '7:35 pm', text: 'Home. Power on: 39°C and idle. I start reading the logs.' },
    { time: '7:50 pm', text: 'A controlled repeat of the same kind of request: 38°C to 88°C in 28 seconds, then back to the 40s within 20 seconds.' },
    { time: '7:56 pm', text: 'The screen has gone dark, so I press the power button to wake it. On this server that means shut down. Off again.' },
    { time: '8:35 pm', text: 'Fixes deployed: a 25 W burst cap, a heat guard, a Cool down button, a long-press power button, and logging for every alert.' },
  ],
  cause: [
    'The laptop has an Intel Core i3-1315U, a 15 W chip. Its firmware lets it draw 51–55 W for about 30 seconds at a time (Intel calls this PL2), then holds it to 15 W.',
    'Reading a long prompt is pure computation, so a single model request can use that entire burst: all eight threads at 3.2 GHz. Writing the reply is limited by memory speed and runs much cooler.',
    'In my test the temperature rose about 1.5°C every second the burst lasted. The 5:05 pm request ran a few seconds longer, began with a model reload, and started from a warmer afternoon, which is exactly how it reached 95°C.',
    'That is inside Intel’s spec (the chip throttles at 100°C), and it wasn’t the vents or the sun. The real problem was the alert: it fired on one reading of a normal spike and told me to check the vents, so it read like an emergency.',
  ],
  chart: {
    caption: 'The controlled repeat: one 1,112-token prompt on the 4B model, CPU temperature every half second. The dashed line is the 95°C reading behind the alert.',
    // seconds since the start, °C (every other sample of the half-second log)
    points: [[0, 38], [1.1, 37], [2.1, 37], [3.2, 57], [4.3, 67], [5.4, 74], [6.5, 66], [7.6, 69], [8.6, 77], [9.7, 61], [10.8, 74], [11.9, 79], [13, 79], [14, 77], [15.1, 82], [16.2, 81], [17.3, 82], [18.4, 72], [19.5, 80], [20.6, 80], [21.7, 82], [22.7, 84], [23.8, 80], [24.9, 84], [26, 88], [27.1, 84], [28.2, 88], [29.3, 69], [30.4, 66], [31.4, 66], [32.6, 61], [33.7, 63], [34.8, 61], [35.9, 62], [36.9, 51], [38, 50], [39, 48], [40.1, 48], [41.1, 47], [42.2, 46], [43.3, 46], [44.3, 45], [45.4, 46], [46.4, 45], [47.5, 44], [48.6, 43], [49.6, 43], [50.7, 43], [51.7, 42], [52.8, 42], [53.9, 42], [54.9, 42], [56, 42]],
    phases: [{ from: 3, to: 29, label: 'Reading the prompt' }, { from: 29, to: 36, label: 'Writing' }],
  },
  shots: [
    { src: `${JAI}alerts.jpg`, alt: 'Three notifications from the agent: server running hot at 95°C, approval needed for sudo shutdown now, and task done', caption: 'What reached my phone on the trail, oldest at the bottom: the heat alert, the assistant asking to shut the server down, and the task ending without doing anything. Wallpaper blurred.' },
    { src: `${JAI}assistant-stop.jpg`, alt: 'The agent panel on a phone, working on the task “Stop all task and give CPU rest”', caption: 'Asking the assistant to stop everything only gave the model more work.' },
    { src: `${JAI}poweroff.jpg`, alt: 'A terminal on the phone running sudo poweroff on the server, with the broadcast “The system will power off now!”', caption: '5:24 pm: shutting it down over SSH from my phone, through Tailscale. Address blurred.' },
    { src: `${JAI}tailscale-offline.jpg`, alt: 'The Tailscale app showing the phone online and the server offline', caption: 'Tailscale confirms the server is off. Device addresses blurred.' },
  ],
  sections: [
    {
      heading: 'What went right',
      points: [
        'I could reach the server from a mountain. Tailscale and an SSH app on my phone were enough to shut it down cleanly, 18 minutes after the alert.',
        'The approval gate held. The assistant asked to run sudo shutdown now, and nothing happened without my yes.',
        'Nothing was lost. Both shutdowns were orderly, the night’s search had already finished, and the agent picks up where it left off.',
        'The logs told the whole story: the systemd journal, sar’s CPU history and Ollama’s timings put every step to the second.',
      ],
    },
    {
      heading: 'What went wrong',
      points: [
        'The alert went off on a single reading of a normal burst, and gave no hint that short spikes are expected.',
        'There was no rest button. The only way to slow the agent down from my phone was to ask its own AI, which added load.',
        'Switching Auto mode off also stopped the 6 pm to-do list, and nothing in the logs said so. It took real digging to tell a stopped schedule from a broken one.',
        'Pressing the power button to wake the screen shut the server down. A sensible default for a laptop is the wrong one for a server.',
      ],
    },
    {
      heading: 'What I changed',
      points: [
        'Turbo bursts are capped at 25 W, re-applied every minute in case the firmware restores its own limits. Sustained power stays at 15 W.',
        'A heat guard replaces the old alert: only if the CPU stays at 90°C for a full minute does the agent pause its AI work, unload the model, and send one calm alert. It carries on by itself below 70°C.',
        'A Cool down button on the home screen pauses the agent for an hour, and the status bar says when it’s cooling.',
        'A short press of the power button now does nothing; holding it shuts down cleanly.',
        'Every push notification and scheduled send is logged with how many devices received it, and the panel shows when the scheduler last ran.',
        'While digging, I found Auto mode refitting its model on every page refresh. That’s fixed too.',
      ],
    },
    {
      heading: 'What I learned',
      points: [
        'An alert should say what’s normal and what to do. “95°C” with no context sent me to an SSH prompt on a mountain.',
        'Give yourself a way to stop the system that doesn’t depend on the system. Asking an overworked AI to calm down makes it work harder.',
        'Measure before you blame. I suspected sunlight and dust; the data said turbo bursts.',
        'A headless server needs server defaults, like a power button that doesn’t mean “off”.',
        'Log the boring things. The question that took longest wasn’t the heat, it was “did that alert ever go out?”',
      ],
    },
  ],
}

// Peer-reviewed publication. Every metadata field here — title, author order,
// volume, issue, pages, ISSN — and every figure in `metrics` is taken from the
// published PDF itself, so the citation on the site matches the record of
// publication. The summary is written for a portfolio reader rather than copied
// from the paper.
export const research = [
  {
    title: 'Program for Emotion-Responsive MIDI Proposal',
    role: 'First author',
    venue: 'International Journal of Engineering and Techniques (IJET)',
    venueShort: 'IJET',
    volume: 'Volume 11 · Issue 3',
    date: 'May 2024',
    pages: 'pp. 78–82',
    issn: '2395-1303',
    authors: [
      'Bikumandla Sai Satwik',
      'Balagouni Nikitha Goud',
      'Gunda Sai Rudresh Reddy',
      'Konduri Sanjay',
      'U. Bhaskar',
    ],
    // Rendered in accent so a scanning recruiter finds the name instantly.
    me: 'Bikumandla Sai Satwik',
    affiliation: 'Sri Indu College of Engineering & Technology (A), CSIT — Hyderabad, India',
    summary:
      'Written in the final year of my B.Tech: a system that reads the emotion off a face through the built-in camera and cues a playlist to match it. A convolutional neural network handles the classification; Pygame and Tkinter handle playlist generation and playback. The argument of the paper is that inferring mood from the face removes what every earlier approach charged the listener — manual song selection, a wearable sensor, or an audio-feature classifier that never actually looked at the person.',
    metrics: [
      { value: '95.14%', label: 'Detection accuracy' },
      { value: '30,219', label: 'FER2013 images' },
      { value: '5', label: 'Emotion classes' },
    ],
    points: [
      'CNN emotion classifier reaching roughly 95.14% accuracy on facial expression detection.',
      'Trained and tested on FER2013 — 24,176 training and 6,043 test images, 48×48 grayscale — labelled across five emotions: happy, sad, angry, surprise, and neutral.',
      'Live capture from the inbuilt camera, so the input to the system is a face rather than a form.',
      'Playlist generation and playback in Pygame & Tkinter, over a song library assembled from Bollywood Hindi tracks.',
      'Argued and measured against the alternatives it replaces — manual sorting, wearable devices, and audio-feature classification — on computational time and cost.',
    ],
    keywords: [
      'Emotion Detection',
      'Face Recognition',
      'Deep Learning',
      'Music Automation',
      'AI Music Recommendation',
    ],
    href: 'https://ijetjournal.org/ai-emotion-responsive-music/',
    pdf: 'https://ijetjournal.org/wp-content/uploads/IJET-V10I3P14.pdf',
    citation:
      'Bikumandla Sai Satwik, Balagouni Nikitha Goud, Gunda Sai Rudresh Reddy, Konduri Sanjay, U. Bhaskar, "Program for Emotion-Responsive MIDI Proposal," International Journal of Engineering and Techniques, Volume 11, Issue 3, May 2024, pp. 78–82. ISSN 2395-1303.',
  },
]

export const experience = [
  {
    role: 'Website Design Intern',
    company: 'Rethink UX',
    period: 'Oct 2022 – Dec 2022',
    points: [
      'Designed and built client-facing website features in HTML, CSS, and JavaScript, taking assigned modules from requirements through delivery.',
      'Implemented access-control logic to restrict page features by user role.',
      'Wrote technical documentation for the features I built, making handoff easier for the team after the internship ended.',
      'Participated in code reviews with senior engineers and incorporated feedback to meet production standards.',
    ],
  },
  {
    role: 'Programming Content Intern',
    company: 'StudyExperts',
    period: 'Jun 2022 – Aug 2022',
    points: [
      'Created programming tutorials and technical knowledge-base articles covering Python, Java, and data structures, serving as self-service resources for the platform\'s users.',
      'Wrote, tested, and debugged code examples across multiple languages to ensure published content was accurate and runnable.',
      'Demonstrated that strong written communication and deep product understanding are force multipliers for small engineering teams — a lesson that informs how I document and advocate for my own projects.',
    ],
  },
]

export const education = [
  {
    school: 'University at Albany, SUNY',
    degree: 'M.S. in Computer Science',
    period: 'Aug 2024 – May 2026',
    location: 'Albany, NY',
    coursework:
      'Operating Systems, Computer Security, Algorithms & Data Structures, Database Systems, Artificial Intelligence, Computer Vision, Probability & Computing',
  },
  {
    school: 'Sri Indu College of Engineering & Technology (JNTUH)',
    degree: 'B.Tech in Computer Science & Information Technology',
    period: 'Aug 2020 – Apr 2024',
    location: 'Hyderabad, India',
    coursework:
      'Machine Learning, AI, Compiler Construction, Computer Networks, Software Engineering, Software Testing Methodologies',
  },
]

export const languages = [
  { name: 'Telugu', level: 'Native' },
  { name: 'Hindi', level: 'Fluent' },
  { name: 'English', level: 'Fluent' },
  { name: 'German', level: 'Learning' },
]

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Work', to: '/work' },
  { label: 'Journey', to: '/journey' },
  { label: 'Contact', to: '/contact' },
]

// EmailJS configuration (carried over from the original site).
export const emailjsConfig = {
  publicKey: 'j_PeRhatSYVxAj1Gw',
  serviceId: 'service_a0t4i5e',
  templateId: 'template_gb64xgq',
}
