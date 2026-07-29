import { Outlet } from 'react-router-dom'
import ScrollProgress from './ScrollProgress.jsx'
import CursorGlow from './CursorGlow.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import BackToTop from './BackToTop.jsx'
import ChatBot from './ChatBot.jsx'
import SpideyEgg from './SpideyEgg.jsx'
import NavIntro from './NavIntro.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import JourneyGlimpse from './JourneyGlimpse.jsx'

// Chrome that has to persist across every route: header, floating widgets, and
// the one-time intro takeover. Routed pages render into <Outlet/>.
export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <ScrollProgress />
      <CursorGlow />
      <Header />
      <main>
        <Outlet />
      </main>
      {/* Site-wide, so the map is always one click away. Hides itself on
          /journey — see JourneyGlimpse. */}
      <JourneyGlimpse />
      <Footer />
      <BackToTop />
      <ChatBot />
      <SpideyEgg />
      {/* Runs once on a first visit. Visitors used to meet a full-screen intro
          takeover before this; with that gone these coach marks are the only
          thing that greets them. */}
      <NavIntro />
    </>
  )
}
