import { Outlet } from 'react-router-dom'
import PageSubNav from '../components/PageSubNav.jsx'
import PageNext from '../components/PageNext.jsx'

// Tabs are routes: /work, /work/research, /work/experience. See AboutPage —
// same shell, same contract.
const TABS = [
  { to: '/work', label: 'Projects' },
  { to: '/work/research', label: 'Research' },
  { to: '/work/experience', label: 'Experience' },
]

export default function WorkPage() {
  return (
    <>
      <PageSubNav items={TABS} />
      <Outlet />
      <PageNext
        to="/journey"
        title="Journey"
        blurb="Four cities and one very long flight — walk the whole route yourself."
      />
    </>
  )
}
