import { useReveal } from '../hooks/useReveal.js'

// Section wrapper that fades its content in on scroll and renders an optional
// heading. `num` renders a story-chapter marker before the eyebrow, and `lead`
// is a one-line narrative hook under the title.
export default function Section({ id, title, eyebrow, num, lead, className = '', children }) {
  const [ref, visible] = useReveal()

  return (
    <section
      id={id}
      ref={ref}
      className={`section ${className} ${visible ? 'is-visible' : ''}`}
    >
      {title && (
        <header className="section-head">
          {eyebrow && (
            <span className="section-eyebrow">
              {num && <span className="section-num">{num}</span>}
              {eyebrow}
            </span>
          )}
          <h2 className="section-title">{title}</h2>
          {lead && <p className="section-lead">{lead}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
