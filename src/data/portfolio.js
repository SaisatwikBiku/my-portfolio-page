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
  { name: 'Google AI Essentials', issuer: 'Google', date: 'July 2026' },
  { name: 'Building with the Claude API', issuer: 'Anthropic', date: 'March 2026' },
]

export const projects = [
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
