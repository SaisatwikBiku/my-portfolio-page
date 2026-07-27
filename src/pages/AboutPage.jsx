import About from '../components/About.jsx'
import Skills from '../components/Skills.jsx'
import Education from '../components/Education.jsx'
import PageSubNav from '../components/PageSubNav.jsx'
import PageNext from '../components/PageNext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
]

export default function AboutPage() {
  usePageTitle('About')

  return (
    <>
      <PageSubNav items={SECTIONS} />
      <About />
      <Skills />
      <Education />
      <PageNext
        to="/work"
        title="Work"
        blurb="Projects, published research, experience — and a playable map of the journey."
      />
    </>
  )
}
