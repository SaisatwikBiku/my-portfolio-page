// Minimal front-matter parser for blog posts. Plain JS with no Node APIs, so the
// browser bundle and the RSS step in vite.config.js share it. It handles the
// handful of shapes a post header actually uses:
//
//   title: Some title          → string (quotes optional)
//   draft: true                → boolean
//   tags: [react, vite]        → array of strings
//
// Anything fancier (nested maps, multi-line values) isn't supported on purpose;
// pulling in a full YAML parser for five keys isn't worth the bundle weight.
export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, body: raw }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!m) continue
    data[m[1]] = parseValue(m[2].trim())
  }
  return { data, body: raw.slice(match[0].length) }
}

function parseValue(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => unquote(item.trim()))
      .filter(Boolean)
  }
  return unquote(value)
}

function unquote(value) {
  const q = value[0]
  if ((q === '"' || q === "'") && value.endsWith(q)) return value.slice(1, -1)
  return value
}

// "my-first-post.md" → "my-first-post". Also strips a leading date prefix
// ("2026-10-15-my-first-post.md") so files can sort by date on disk without
// the date leaking into the URL.
export function slugFromPath(path) {
  return path
    .split('/')
    .pop()
    .replace(/\.md$/, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

// Average adult silent reading speed is roughly 200–250 wpm; 220 splits it.
export function readingMinutes(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

// The inverse of parseFrontmatter, used by the admin editor to write a post
// back to disk. Strings are always double-quoted so a title containing ": "
// or starting with "[" can't be misread as another type; newlines are flattened
// because the parser reads one line per field.
export function stringifyPost({ title, date, summary, tags = [], cover, draft }, body) {
  const str = (v) => `"${String(v ?? '').replace(/\s*\r?\n\s*/g, ' ').trim()}"`
  const lines = [`title: ${str(title)}`, `date: ${date}`]
  if (summary) lines.push(`summary: ${str(summary)}`)
  if (tags.length) lines.push(`tags: [${tags.join(', ')}]`)
  if (cover) lines.push(`cover: ${str(cover)}`)
  if (draft) lines.push('draft: true')
  return `---\n${lines.join('\n')}\n---\n\n${String(body ?? '').replace(/^(\s*\n)+/, '').trimEnd()}\n`
}

// "Hello, World: Part 2!" → "hello-world-part-2"
export function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const TAG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
