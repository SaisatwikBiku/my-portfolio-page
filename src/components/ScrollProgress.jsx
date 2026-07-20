import { useEffect, useState } from 'react'

// Web-swing scroll progress: a web-textured line pinned to the top of the
// viewport, with a little spider rappelling along the leading edge to mark how
// far through the page the visitor has scrolled.
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? window.scrollY / max : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="scroll-web" aria-hidden="true">
      <div className="scroll-web-fill" style={{ transform: `scaleX(${progress})` }} />
      <div className="scroll-web-spider" style={{ left: `${progress * 100}%` }}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          {/* body */}
          <ellipse cx="12" cy="13" rx="3" ry="3.6" />
          <circle cx="12" cy="8.6" r="1.9" />
          {/* eight legs */}
          <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none">
            <path d="M9 11 4 8" />
            <path d="M9 13 3.5 13" />
            <path d="M9 15 4 18" />
            <path d="M9.5 16 6 20" />
            <path d="M15 11 20 8" />
            <path d="M15 13 20.5 13" />
            <path d="M15 15 20 18" />
            <path d="M14.5 16 18 20" />
          </g>
        </svg>
      </div>
    </div>
  )
}
