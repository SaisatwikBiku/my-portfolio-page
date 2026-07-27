import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import WorkPage from './pages/WorkPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/work" element={<WorkPage />} />
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
