import ScrollProgress from './components/ScrollProgress.jsx'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import TechMarquee from './components/TechMarquee.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'
import ChatBot from './components/ChatBot.jsx'

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Home />
        <TechMarquee />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <ChatBot />
    </>
  )
}
