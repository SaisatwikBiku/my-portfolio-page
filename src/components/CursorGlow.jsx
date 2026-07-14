import { useEffect, useRef } from 'react'

// Soft spotlight that trails the cursor — pure atmosphere, no interaction.
// Skipped on touch devices and for users who prefer reduced motion.
export default function CursorGlow() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const el = ref.current
    if (!el) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 3
    let tx = x
    let ty = y
    let raf = 0

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      el.style.opacity = '1'
    }
    const tick = () => {
      x += (tx - x) * 0.1
      y += (ty - y) * 0.1
      el.style.transform = `translate(${x - 300}px, ${y - 300}px)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div className="cursor-glow" ref={ref} aria-hidden="true" />
}
