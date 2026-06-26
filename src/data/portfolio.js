// Centralized content for the portfolio — sourced from the latest resume.

const ICON = (name) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}.svg`

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
    'I ship complete systems — not just components. From frontend to backend to ML, I take ambiguous problems from idea to working, deployed software.',
  location: 'Albany, NY',
  email: 'bikumandlasaisatwik@gmail.com',
  phone: '+1 518 614 1904',
  resume: '/SaiSatwikBikumandla_SWE.pdf',
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
    "I've shipped a version-controlled resume platform with a server-side LaTeX pipeline, a real-time YOLO-based sports tracking system, and a cloud-secured relational database on Google Cloud SQL. I'm driven by project-based learning and turning fuzzy, real-world problems into software people can actually use.",
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
      { name: 'Google Cloud', icon: ICON('googlecloud/googlecloud-original') },
      { name: 'Docker', icon: ICON('docker/docker-original') },
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
      'A full-stack SaaS-style app giving job seekers a GitHub-inspired resume workflow: named repositories, commit snapshots, full version history, and rollback to any prior state — backed by a server-side LaTeX compilation endpoint that exports print-ready PDFs from any historical commit.',
    tags: ['Next.js', 'MongoDB', 'NextAuth', 'LaTeX'],
    href: 'https://github.com/SaisatwikBiku/latex-resume-builder',
  },
  {
    title: 'Tennis Ball Detection & Tracking',
    subtitle: 'Real-Time Computer Vision Pipeline',
    year: '2025',
    description:
      'A YOLO-based tracking system using SORT for multi-object tracking, anti-jump filtering, exponential smoothing, and velocity extrapolation. Generates structured per-session analytics (velocity peaks, trajectory distance, detection rate) and ships as an interactive Gradio app.',
    tags: ['YOLO', 'SORT', 'Gradio', 'OpenCV'],
    private: true,
  },
  {
    title: 'Movie Recommendation System',
    subtitle: 'Content-Based NLP Engine',
    year: '2025',
    description:
      'A content-based recommender over 5,000+ films using TF-IDF vectorization and cosine similarity, with a full NLP preprocessing pipeline. Evaluated relevance with Precision@K (K = 5, 10, 20) for data-driven threshold tuning over a random baseline.',
    tags: ['TF-IDF', 'NLP', 'scikit-learn', 'Python'],
    href: 'https://github.com/SaisatwikBiku/movie-recommender-v2',
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
    title: 'Next-Word Predictor',
    subtitle: 'LSTM Language Model',
    year: '2025',
    description:
      'An LSTM language model (Embedding → LSTM 150 → Softmax) trained in TensorFlow/Keras on IMDB reviews. Built the full data pipeline — tokenization, sliding-window sequencing, padding, one-hot encoding — with checkpoint-based persistence for instant reloads.',
    tags: ['TensorFlow', 'Keras', 'LSTM', 'NLP'],
    href: 'https://github.com/SaisatwikBiku/next_word_prediction',
  },
  {
    title: 'Web Prototype Generator',
    subtitle: 'AI-Assisted Code Generation',
    year: '2024',
    description:
      'Led the Gemini API integration layer, building a prompt-engineering pipeline that converts natural-language client briefs into responsive HTML/CSS/JS prototypes with auto-embedded imagery. Backend service layer built with Flask; introduced AI-attribution tagging standards.',
    tags: ['Gemini API', 'Flask', 'Prompt Engineering'],
    href: 'https://github.com/SaisatwikBiku/prototype-generator-for-web-dev',
  },
]

export const experience = [
  {
    role: 'Web Developer Intern',
    company: 'Rethink UX',
    period: 'Oct 2022 – Dec 2022',
    points: [
      'Took sole ownership of 3 client-facing web feature modules from requirements to deployment, independently designing a role-based access control system later reused as a standard security layer.',
      'Self-initiated technical documentation that was adopted into the standard onboarding workflow, reducing ramp-up friction for engineers joining after the internship.',
      'Earned consistent code-review approvals from senior engineers within the first two weeks, writing production-quality code under professional standards.',
    ],
  },
  {
    role: 'Developer Advocate',
    company: 'StudyExperts',
    period: 'Jun 2022 – Aug 2022',
    points: [
      'Served as the technical bridge between engineering and users, translating complex product behavior into clear, actionable content for a developer audience.',
      'Authored a structured library of tutorials and knowledge-base articles that became the primary self-service resource, measurably reducing repeated support escalations.',
      'Operated as an informal QA layer — reproduced 10+ edge-case defects with full reproduction steps and environment context for immediate engineering action.',
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
