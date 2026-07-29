import { useEffect, useRef } from 'react'

// A soft spotlight that eases along behind the pointer — pure atmosphere.
// Desktop-only and skipped for reduced motion.
//
// This used to also draw a "web" filament tracing the pointer's recent path on
// a canvas. That read as a distracting line following the cursor, so it's gone;
// the pointer's own appearance now carries the theme instead (see the custom
// cursors in index.css, which swap per light / dark / Spidey mode).
export default function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const glow = glowRef.current
    if (!glow) return

    let gx = window.innerWidth / 2
    let gy = window.innerHeight / 3
    let tx = gx
    let ty = gy
    let raf = 0

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      glow.style.opacity = '1'
    }

    const tick = () => {
      gx += (tx - gx) * 0.1
      gy += (ty - gy) * 0.1
      glow.style.transform = `translate(${gx - 300}px, ${gy - 300}px)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div className="cursor-glow" ref={glowRef} aria-hidden="true" />
}
