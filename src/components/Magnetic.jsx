import { useRef } from 'react'

// Wraps a child so it drifts toward the cursor — a small magnetic pull that
// springs back on leave. No-op under reduced motion.
export default function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null)

  const onMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }
  const onLeave = () => {
    ref.current.style.transform = ''
  }

  return (
    <span className="magnetic" ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </span>
  )
}
