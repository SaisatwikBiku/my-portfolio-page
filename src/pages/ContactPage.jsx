import Contact from '../components/Contact.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function ContactPage() {
  usePageTitle('Contact')

  return <Contact />
}
