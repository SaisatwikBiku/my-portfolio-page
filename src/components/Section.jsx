import { useReveal } from '../hooks/useReveal.js'

// Section wrapper that fades its content in on scroll and renders an optional heading.
export default function Section({ id, title, eyebrow, className = '', children }) {
  const [ref, visible] = useReveal()

  return (
    <section
      id={id}
      ref={ref}
      className={`section ${className} ${visible ? 'is-visible' : ''}`}
    >
      {title && (
        <header className="section-head">
          {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
          <h2 className="section-title">{title}</h2>
        </header>
      )}
      {children}
    </section>
  )
}
