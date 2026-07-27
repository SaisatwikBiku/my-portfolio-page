# Sai Satwik Bikumandla — Portfolio

Personal portfolio site built with **React**, **Vite** and **React Router**. Covers my
background, skills, projects, published research, and work history as a software engineer.

🌐 **Live:** [satwik.info](https://satwik.info)

## Pages

| Route | Contents |
| --- | --- |
| `/` | Hero, tech marquee, and an Explore hub linking onward |
| `/about` | About me · Skills · Education, certifications & languages |
| `/work` | Projects · Research (peer-reviewed publication) · Experience |
| `/journey` | The playable map — my résumé as a small top-down world |
| `/contact` | Contact form and links |

Pages hand off to the next one in order, so the site still reads as one narrative.

## Highlights

- **The Journey** — a top-down game that happens to be a résumé. The world isn't an
  image: `src/lib/journeyWorld.js` grows the island, forests, towns and roads from a
  seeded noise field, and `journeyPaint.js` paints it to canvas. It re-paints with the
  site theme, and the same grid used for drawing is the collision map. Walk up to a
  marker and it opens that chapter. Every page carries a `JourneyGlimpse` teaser that
  links to it.
- **Spidy**, an AI chatbot answering questions about me, backed by a serverless
  function so the API key never reaches the client.
- **Three themes** — light, dark, and a Spider-Man mode, all driven by CSS variables.
- **Code-split** — the Three.js hero backdrop and the Journey's world generator each
  load on demand rather than in the main bundle.

## Tech Stack

- **React 18** — component-based UI
- **React Router 7** — client-side routing
- **Vite** — dev server & build tooling
- **Three.js** — 3D hero backdrop (lazy-loaded)
- **Canvas 2D** — the Journey map's world and characters
- **Vanilla CSS** — custom design system with CSS variables (no UI framework)
- **@emailjs/browser** — contact form delivery
- **Gemini API** — chatbot, via a Vercel serverless function

## Getting Started

```bash
npm install
```

The chatbot needs a Gemini API key. Create a `.env.local` in the project root
(it's gitignored):

```bash
GEMINI_API_KEY=your-key-here
```

Everything except the chatbot works without it.

```bash
# Start the dev server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview the production build
npm run preview
```

`vite.config.js` mounts the `/api/chat` serverless handler into the dev server, so the
chatbot behaves the same locally as in production.

## Project Structure

```
api/chat.js             Serverless chatbot endpoint (Gemini; key stays server-side)
public/                 Static assets (images, walker sprite, résumé PDF)
src/
  pages/                One component per route
  components/           Sections (About, Projects, Research, …) + chrome (Header, Layout)
  data/portfolio.js     Single source of truth for site content
  data/journey.js       The Journey's chapters, coordinates and roads
  lib/                  Journey world generation and canvas painting
  hooks/                useReveal, useTyped, useScrollSpy, useCountUp, usePageTitle
  styles/index.css      Global design system & styles
  App.jsx               Routes
  main.jsx              Entry point
vercel.json             SPA rewrites so deep links resolve (excludes /api)
```

To update content (projects, research, experience, skills, links), edit
[`src/data/portfolio.js`](src/data/portfolio.js); for the map's chapters, edit
[`src/data/journey.js`](src/data/journey.js). Neither needs component changes.

## Deployment

Deployed on Vercel. Because routing is client-side, `vercel.json` rewrites every
non-`/api` path to `index.html` — without it, loading `/work` directly returns a 404.

---
© Sai Satwik Bikumandla
