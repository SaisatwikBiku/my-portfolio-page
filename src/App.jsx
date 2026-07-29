import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import WorkPage from './pages/WorkPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Education from './components/Education.jsx'
import Projects from './components/Projects.jsx'
import Research from './components/Research.jsx'
import Experience from './components/Experience.jsx'

// The Journey drags in the procedural world generator and its ~1,300-line
// painter, which nothing else on the site uses. Now that it has a route of its
// own it can be split out, so the other four pages never download it — same
// treatment Hero3D already gets in Home.jsx.
const JourneyPage = lazy(() => import('./pages/JourneyPage.jsx'))

// Site order tells a story: who I am → what I work with → what I've built
// (proof first) → walk the route → say hi. Each page below is one chapter;
// Layout is the chrome that stays put while the chapters change.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        {/* About and Work are tab shells: the shell renders the tab strip and
            the "next chapter" hand-off, and the selected tab's section renders
            between them. Each tab is a real route with its own URL. */}
        <Route path="/about" element={<AboutPage />}>
          <Route index element={<About />} />
          <Route path="skills" element={<Skills />} />
          <Route path="education" element={<Education />} />
        </Route>
        <Route path="/work" element={<WorkPage />}>
          <Route index element={<Projects />} />
          <Route path="research" element={<Research />} />
          <Route path="experience" element={<Experience />} />
        </Route>
        <Route
          path="/journey"
          element={
            <Suspense fallback={<div className="route-loading" />}>
              <JourneyPage />
            </Suspense>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
