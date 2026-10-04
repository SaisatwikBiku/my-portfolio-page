import { Link } from 'react-router-dom'
import Section from './Section.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { jobAgentIncident } from '../data/portfolio.js'

// Incident report for the job agent. Same building blocks as the case study (metric
// tiles, prose blocks, phone screenshots) plus a timeline and a temperature chart drawn
// from the real test log, so the numbers on the page are the ones the server recorded.

const W = 640
const H = 260
const PAD = { left: 40, right: 16, top: 16, bottom: 34 }
const T_MAX = 56
const C_MIN = 30
const C_MAX = 100

const x = (t) => PAD.left + (t / T_MAX) * (W - PAD.left - PAD.right)
const y = (c) => PAD.top + ((C_MAX - c) / (C_MAX - C_MIN)) * (H - PAD.top - PAD.bottom)

function TempChart({ chart }) {
  const line = chart.points.map(([t, c], i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)},${y(c).toFixed(1)}`).join(' ')
  const peak = chart.points.reduce((a, b) => (b[1] > a[1] ? b : a))
  return (
    <figure className="cs-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`CPU temperature over ${T_MAX} seconds: from 38°C to a peak of ${peak[1]}°C while the prompt was read, then back to 42°C`}>
        {chart.phases.map((p) => (
          <g key={p.label}>
            <rect className="cs-chart-phase" x={x(p.from)} y={PAD.top} width={x(p.to) - x(p.from)} height={H - PAD.top - PAD.bottom} />
            <text className="cs-chart-phase-label" x={x(p.from) + 6} y={H - PAD.bottom - 8}>{p.label}</text>
          </g>
        ))}
        {[40, 60, 80, 100].map((c) => (
          <g key={c}>
            <line className="cs-chart-grid" x1={PAD.left} x2={W - PAD.right} y1={y(c)} y2={y(c)} />
            <text className="cs-chart-axis" x={PAD.left - 8} y={y(c) + 4} textAnchor="end">{c}°</text>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <text className="cs-chart-axis" key={t} x={x(t)} y={H - PAD.bottom + 18} textAnchor="middle">{t}s</text>
        ))}
        <line className="cs-chart-limit" x1={PAD.left} x2={W - PAD.right} y1={y(95)} y2={y(95)} />
        <text className="cs-chart-limit-label" x={W - PAD.right - 4} y={y(95) - 6} textAnchor="end">95°C alert</text>
        <path className="cs-chart-line" d={line} />
        <circle className="cs-chart-peak" cx={x(peak[0])} cy={y(peak[1])} r="4" />
        <text className="cs-chart-peak-label" x={x(peak[0]) + 8} y={y(peak[1]) + 4}>{peak[1]}°C</text>
      </svg>
      <figcaption>{chart.caption}</figcaption>
    </figure>
  )
}

function Points({ items }) {
  return (
    <ul className="cs-points">
      {items.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  )
}

export default function JobAgentIncident() {
  const p = jobAgentIncident
  usePageTitle('Job Agent incident report')

  return (
    <Section id="job-agent-incident" title={p.title} lead={p.lead} className="case-study">
      <Link className="cs-back" to="/work/job-agent">
        ← Job Agent
      </Link>

      <p className="cs-summary">{p.summary}</p>

      <div className="cs-metrics">
        {p.metrics.map((m) => (
          <div className="cs-metric" key={m.label}>
            <span className="cs-metric-value">{m.value}</span>
            <span className="cs-metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="cs-body">
        <section className="cs-block">
          <h3>Timeline</h3>
          <ol className="cs-timeline">
            {p.timeline.map((e) => (
              <li key={e.time + e.text}>
                <span className="cs-timeline-time">{e.time}</span>
                <span className="cs-timeline-text">{e.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <h3 className="cs-subhead">From the trail</h3>
      <div className="cs-phones cs-phones--grid">
        {p.shots.map((shot) => (
          <figure className="cs-shot cs-shot--phone" key={shot.src}>
            <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
            <figcaption>{shot.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="cs-body">
        <section className="cs-block">
          <h3>What was actually going on</h3>
          <Points items={p.cause} />
        </section>
      </div>

      <TempChart chart={p.chart} />

      <div className="cs-body">
        {p.sections.map((s) => (
          <section className="cs-block" key={s.heading}>
            <h3>{s.heading}</h3>
            <Points items={s.points} />
          </section>
        ))}
      </div>

      <div className="cs-actions">
        <Link className="btn btn--primary" to="/work/job-agent">
          Back to the Job Agent
        </Link>
        <Link className="btn btn--ghost" to="/work">
          All projects
        </Link>
      </div>
      <p className="cs-note">Times are Eastern. Every number comes from the server’s own logs or the test that evening.</p>
    </Section>
  )
}
