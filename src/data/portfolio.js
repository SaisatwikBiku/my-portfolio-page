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
  {
    name: 'LeetCode',
    href: 'https://leetcode.com/u/SaiSatwikBikumandla/',
    icon: ICON('leetcode/leetcode-original'),
  },
]

export const about = {
  paragraphs: [
    "I'm a software engineer and Master's student in Computer Science at the University at Albany (SUNY), based in Albany, NY. I build production-grade systems end to end — comfortable across the frontend, backend, and machine-learning layers of a product.",
    "I've shipped a version-controlled resume platform with a dual-render LaTeX pipeline, a real-time tennis ball detection and tracking system, and a cloud-secured relational database on Google Cloud SQL. I'm driven by project-based learning and turning fuzzy, real-world problems into software people can actually use.",
  ],
  highlights: [
    { value: '6+', label: 'Shipped Projects' },
    { value: '3', label: 'Layers: FE · BE · ML' },
    { value: '2026', label: 'MS CS Graduation' },
  ],
}

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
    title: 'Web & Backend',
    skills: [
      { name: 'React', icon: ICON('react/react-original') },
      { name: 'Next.js', icon: ICON('nextjs/nextjs-original') },
      { name: 'Node.js', icon: ICON('nodejs/nodejs-original') },
      { name: 'Flask', icon: ICON('flask/flask-original') },
      { name: 'HTML5', icon: ICON('html5/html5-original') },
      { name: 'CSS3', icon: ICON('css3/css3-original') },
    ],
  },
  {
    title: 'Databases',
    skills: [
      { name: 'MySQL', icon: ICON('mysql/mysql-original') },
      { name: 'MongoDB', icon: ICON('mongodb/mongodb-original') },
      { name: 'Cloud SQL', icon: ICON('googlecloud/googlecloud-original') },
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
    title: 'Tools & Cloud',
    skills: [
      { name: 'Git', icon: ICON('git/git-original') },
      { name: 'Docker', icon: ICON('docker/docker-original') },
      { name: 'Google Cloud', icon: ICON('googlecloud/googlecloud-original') },
      { name: 'LaTeX', icon: ICON('latex/latex-original') },
      { name: 'MATLAB', icon: ICON('matlab/matlab-original') },
    ],
  },
]

export const projects = [
  {
    title: 'LaTeX Resume Builder',
    subtitle: 'Version-Controlled Resume Platform',
    year: '2025',
    description:
      'A full-stack SaaS-style app giving job seekers a GitHub-inspired resume workflow: named repositories, commit snapshots, full version history, and rollback to any prior state. A dual-render pipeline pairs an HTML live preview for zero-latency editing with a server-side LaTeX endpoint that exports print-ready PDFs from any historical commit.',
    tags: ['Next.js', 'MongoDB', 'NextAuth', 'LaTeX'],
    href: 'https://github.com/SaisatwikBiku/latex-resume-builder',
  },
  {
    title: 'Movie Recommendation System',
    subtitle: 'Content-Based NLP Engine',
    year: '2025',
    description:
      'A content-based recommender over 5,000+ films using TF-IDF vectorization and cosine similarity, with a full NLP preprocessing pipeline (tokenization, lemmatization, stop-word removal). Evaluated relevance with Precision@K (K = 5, 10, 20) for data-driven threshold tuning over a random baseline.',
    tags: ['TF-IDF', 'NLP', 'scikit-learn', 'Python'],
    href: 'https://github.com/SaisatwikBiku/movie-recommender-v2',
  },
  {
    title: 'Tennis Ball Detection & Tracking',
    subtitle: 'Real-Time Computer Vision Pipeline',
    year: '2025',
    description:
      'Two production-quality tracking systems built on Roboflow\'s detection API: anti-jump filtering, exponential smoothing, velocity extrapolation, court-side A/B classification, and SORT multi-object tracking with per-track trajectory trails. A TrackingAnalytics engine exports structured per-session JSON, all wrapped in an interactive Gradio UI.',
    tags: ['Roboflow', 'SORT', 'Gradio', 'Computer Vision'],
    private: true,
  },
  {
    title: 'Next-Word Predictor',
    subtitle: 'LSTM Language Model',
    year: '2025',
    description:
      'An LSTM language model (Embedding → LSTM 150 → Softmax) trained in TensorFlow/Keras on a 20,000-token corpus of IMDB reviews. Built the full data pipeline — tokenization, sliding-window sequencing, padding, one-hot encoding — with checkpoint-based persistence for instant reloads.',
    tags: ['TensorFlow', 'Keras', 'LSTM', 'NLP'],
    href: 'https://github.com/SaisatwikBiku/next_word_prediction',
  },
  {
    title: 'MyDishDB',
    subtitle: 'Cloud-Deployed Relational Database',
    year: '2025',
    description:
      'A fully normalized MySQL schema (E-R → DDL) spanning 10+ entities with CHECK constraints, triggers, and referential integrity. Deployed on Google Cloud SQL with role-based access control and a JWT-authenticated backend, optimized with indexed multi-table JOINs.',
    tags: ['MySQL', 'Google Cloud SQL', 'JWT', 'Schema Design'],
    private: true,
  },
  {
    title: 'Web Prototype Generator',
    subtitle: 'AI-Assisted Code Generation',
    year: '2024',
    description:
      'Led the Gemini API integration layer, building a prompt-engineering pipeline that converts natural-language client briefs into responsive HTML/CSS/JS prototypes with auto-embedded Unsplash imagery. Backend service layer built with Flask; introduced AI-attribution tagging standards adopted across the team codebase.',
    tags: ['Gemini API', 'Flask', 'Prompt Engineering'],
    href: 'https://github.com/SaisatwikBiku/prototype-generator-for-web-dev',
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
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

// EmailJS configuration (carried over from the original site).
export const emailjsConfig = {
  publicKey: 'j_PeRhatSYVxAj1Gw',
  serviceId: 'service_a0t4i5e',
  templateId: 'template_gb64xgq',
}
