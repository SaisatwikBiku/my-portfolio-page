import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync } from 'node:fs'
import { parseFrontmatter, slugFromPath } from './src/lib/frontmatter.js'
import { profile, site } from './src/data/portfolio.js'

// Mounts the Vercel serverless functions during local dev, so the chatbot, the
// contact form's email verification and the blog editor work under `npm run dev` exactly as
// they do in production.
const API_ROUTES = ['chat', 'otp', 'admin']

function localApiRoutes(env) {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      for (const route of API_ROUTES) {
        server.middlewares.use(`/api/${route}`, async (req, res) => {
          // .env.local reaches the handlers the same way Vercel's project
          // environment does — through process.env.
          for (const [key, value] of Object.entries(env)) {
            if (process.env[key] === undefined) process.env[key] = value
          }
          const { default: handler } = await server.ssrLoadModule(`/api/${route}.js`)
          handler(req, res)
        })
      }
    },
  }
}

// Writes /rss.xml from the Markdown posts at build time, so readers can follow
// the blog in a feed reader. Drafts are left out, same as on the site.
const BLOG_DIR = 'src/content/blog'

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function blogRss() {
  return {
    name: 'blog-rss',
    apply: 'build',
    generateBundle() {
      const posts = readdirSync(BLOG_DIR)
        .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
        .map((f) => {
          const { data } = parseFrontmatter(readFileSync(`${BLOG_DIR}/${f}`, 'utf8'))
          return { ...data, slug: data.slug || slugFromPath(f) }
        })
        .filter((p) => p.draft !== true)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))

      const items = posts
        .map((p) => {
          const link = `${site.url}/blog/${p.slug}`
          return `    <item>
      <title>${escapeXml(p.title || p.slug)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(p.summary || '')}</description>
    </item>`
        })
        .join('\n')

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(profile.name)} · Blog</title>
    <link>${site.url}/blog</link>
    <description>Posts by ${escapeXml(profile.name)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`
      this.emitFile({ type: 'asset', fileName: 'rss.xml', source: xml })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApiRoutes(env), blogRss()],
    // Honour PORT when something else assigns one (tooling, a second dev
    // server); otherwise Vite's usual 5173.
    server: { port: Number(process.env.PORT) || 5173 },
  }
})
