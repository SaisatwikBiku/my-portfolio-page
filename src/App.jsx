import ScrollProgress from './components/ScrollProgress.jsx'
import CursorGlow from './components/CursorGlow.jsx'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import TechMarquee from './components/TechMarquee.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Experience from './components/Experience.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'
import ChatBot from './components/ChatBot.jsx'
import SpideyEgg from './components/SpideyEgg.jsx'

// Section order tells a story: who I am → what I work with → what I've built
// (proof first) → where the habits were formed → the foundation → say hi.
export default function App() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header />
      <main>
        <Home />
        <TechMarquee />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <ChatBot />
      <SpideyEgg />
    </>
  )
}
