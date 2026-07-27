import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Plain BrowserRouter doesn't reset scroll position on navigation (that's only
// automatic with a data router's <ScrollRestoration>), so land every route
// change at the top instead of wherever the previous page left off.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
