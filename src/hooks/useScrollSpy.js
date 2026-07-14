import { useEffect, useState } from 'react'

// Returns the id of the section currently at the top of the viewport, so the
// nav can highlight where the visitor is. `offset` accounts for the fixed header.
export function useScrollSpy(ids, offset = 140) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        let current = ids[0]
        for (const id of ids) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= offset) current = id
        }
        setActive(current)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
    // A joined string keeps the dependency stable when callers pass a fresh array.
  }, [ids.join(','), offset]) // eslint-disable-line react-hooks/exhaustive-deps

  return active
}
