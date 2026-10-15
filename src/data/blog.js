import { marked } from 'marked'
import { parseFrontmatter, readingMinutes, slugFromPath } from '../lib/frontmatter.js'

// Every Markdown file in src/content/blog is a post. Vite inlines them at build
// time, so adding a post is just dropping in a new .md file — no registry to
// update. Files starting with "_" (like _template.md) are skipped. The
// front-matter fields are documented in _template.md and the README.
const files = import.meta.glob(['../content/blog/*.md', '!../content/blog/_*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Drafts show up under `npm run dev` so they can be previewed, and are left out
// of production builds.
const showDrafts = import.meta.env.DEV

export const posts = Object.entries(files)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw)
    return {
      slug: data.slug || slugFromPath(path),
      title: data.title || slugFromPath(path),
      date: data.date || '',
      summary: data.summary || '',
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      cover: data.cover || '',
      draft: data.draft === true,
      minutes: readingMinutes(body),
      body,
    }
  })
  .filter((post) => showDrafts || !post.draft)
  // Newest first. ISO dates (YYYY-MM-DD) sort correctly as strings.
  .sort((a, b) => b.date.localeCompare(a.date))

export const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort()

export function getPost(slug) {
  return posts.find((p) => p.slug === slug)
}

// Rendered lazily and cached, so the index page never pays to parse post bodies.
const htmlCache = new Map()
export function renderPost(post) {
  if (!htmlCache.has(post.slug)) {
    htmlCache.set(post.slug, marked.parse(post.body, { gfm: true }))
  }
  return htmlCache.get(post.slug)
}

// "2026-10-15" → "Oct 15, 2026". Parsed as a plain date (no time zone) so a
// post never shows up as the previous day for visitors west of UTC.
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
