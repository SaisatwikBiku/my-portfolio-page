import Projects from '../components/Projects.jsx'
import Research from '../components/Research.jsx'
import Experience from '../components/Experience.jsx'
import PageSubNav from '../components/PageSubNav.jsx'
import PageNext from '../components/PageNext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

const SECTIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'experience', label: 'Experience' },
]

export default function WorkPage() {
  usePageTitle('Work')

  return (
    <>
      <PageSubNav items={SECTIONS} />
      <Projects />
      <Research />
      <Experience />
      <PageNext
        to="/journey"
        title="Journey"
        blurb="Four cities and one very long flight — walk the whole route yourself."
      />
    </>
  )
}
