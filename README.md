# Sai Satwik Bikumandla — Portfolio

Personal portfolio website built with **React** and **Vite**. Showcases my background,
skills, experience, and projects as a software engineer.

🌐 **Live:** [satwik.info](https://satwik.info)

🔗 **Sections:** Home · About · Skills · Experience · Projects · Education · Contact

## Tech Stack

- **React 18** — component-based UI
- **Vite** — dev server & build tooling
- **Vanilla CSS** — custom design system with CSS variables (no UI framework)
- **@emailjs/browser** — contact form delivery

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
public/                 Static assets (images, résumé PDF)
src/
  components/           Section components (Home, About, Skills, …)
  data/portfolio.js     Single source of truth for all content
  hooks/                useReveal (scroll animations), useTyped (typing effect)
  styles/index.css      Global design system & styles
  App.jsx               Page composition
  main.jsx              Entry point
```

To update content (projects, experience, skills, links), edit
[`src/data/portfolio.js`](src/data/portfolio.js) — no component changes needed.

---
© Sai Satwik Bikumandla
