import { useEffect, useState } from 'react'
import Section from './Section.jsx'
import { research } from '../data/portfolio.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

// "Copy citation" — the one thing a reader who cares about a paper actually
// wants to do with it. Falls back to a hidden textarea + execCommand where the
// async clipboard API is unavailable (older Safari, non-secure contexts).
function useCopy() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
  }

  return [copied, copy]
}

function Publication({ paper }) {
  const [copied, copy] = useCopy()

  return (
    <article className="pub-card">
      {/* The spine of a journal on a shelf — decorative, so it stays out of the
          accessibility tree; every string on it repeats in the meta line. */}
      <aside className="pub-spine" aria-hidden="true">
        <span className="pub-spine-mark">{paper.venueShort}</span>
        <span className="pub-spine-vol">{paper.volume}</span>
        <span className="pub-spine-date">{paper.date}</span>
      </aside>

      <div className="pub-body">
        <div className="pub-badges">
          <span className="pub-badge pub-badge--peer">Peer-reviewed</span>
          <span className="pub-badge">{paper.role}</span>
        </div>

        <h3 className="pub-title">{paper.title}</h3>

        <p className="pub-venue">
          {paper.venue} · {paper.volume} · {paper.date} · {paper.pages} · ISSN {paper.issn}
        </p>

        <p className="pub-authors">
          {paper.authors.map((author, i) => (
            <span key={author}>
              {i > 0 && <span className="pub-sep">, </span>}
              <span className={author === paper.me ? 'pub-me' : undefined}>{author}</span>
            </span>
          ))}
        </p>
        <p className="pub-affiliation">{paper.affiliation}</p>

        <p className="pub-summary">{paper.summary}</p>

        <div className="pub-metrics">
          {paper.metrics.map((metric) => (
            <div className="pub-metric" key={metric.label}>
              <span className="pub-metric-value">{metric.value}</span>
              <span className="pub-metric-label">{metric.label}</span>
            </div>
          ))}
        </div>

        <ul className="pub-points">
          {paper.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <div className="pub-keywords">
          {paper.keywords.map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>

        <div className="pub-actions">
          <a className="btn btn--primary" href={paper.href} target="_blank" rel="noreferrer">
            Read the paper →
          </a>
          <a className="btn btn--ghost" href={paper.pdf} target="_blank" rel="noreferrer">
            Full PDF ↓
          </a>
          <button
            type="button"
            className="btn btn--ghost pub-cite-btn"
            onClick={() => copy(paper.citation)}
          >
            {copied ? 'Citation copied ✓' : 'Copy citation'}
          </button>
        </div>

        <p className="pub-citation">{paper.citation}</p>
      </div>
    </article>
  )
}

export default function Research() {
  usePageTitle('Research')

  return (
    <Section
      id="research"
      title="Research"
      lead="Before any of those projects shipped, one idea went through peer review."
      className="research"
    >
      <div className="pub-list">
        {research.map((paper) => (
          <Publication key={paper.title} paper={paper} />
        ))}
      </div>
    </Section>
  )
}
