// Vercel serverless function behind the blog editor (served at the secret
// ADMIN_PATH; see src/lib/adminGate.js).
//
// Sign-in: the only way in is a passcode mailed to ADMIN_EMAIL. The address is
// fixed here on the server, never taken from the request, so nobody else can
// get a code sent to an inbox they control. A correct code earns a session
// cookie, `${expiry}.${HMAC(...)}`, that is HttpOnly (page scripts can't read
// it), SameSite=Strict and scoped to this endpoint. Like otp.js there is no
// database; the signature is the whole session.
//
// Storage: posts are Markdown files committed through the GitHub API.
// Published posts live in this repo's src/content/blog, so publishing is a
// commit that Vercel turns into a deploy. This repo is public, so drafts go to
// a separate private repo (DRAFTS_REPO) when one is configured; without it they
// sit next to the published posts with `draft: true`, hidden from the built
// site but readable on GitHub.
//
// Locally, vite.config.js mounts this same handler at /api/admin.

import crypto from 'node:crypto'
import { readJsonBody, sendJson } from './_http.js'
import { emailjsConfig, sendPasscodeEmail } from './_mail.js'
import { GitHubError, repoClient } from './_github.js'
import {
  SLUG_RE,
  TAG_RE,
  parseFrontmatter,
  slugFromPath,
  stringifyPost,
} from '../src/lib/frontmatter.js'

const COOKIE = 'blog_admin'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const CODE_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5 // wrong guesses per issued code
const IP_WINDOW_MS = 60 * 60 * 1000
const MAX_CODES_PER_IP = 10 // per hour

const SITE_DIR = 'src/content/blog'
const DRAFTS_DIR = 'drafts'
const IMAGE_DIR = 'public/blog'
const MAX_IMAGE_BYTES = 3 * 1024 * 1024 // Vercel caps request bodies at 4.5 MB, base64 adds a third
const IMAGE_TYPES = { png: 'png', jpg: 'jpg', jpeg: 'jpg', webp: 'webp', gif: 'gif', avif: 'avif' }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const POST_FILE_RE = /^(?!_)[\w.-]+\.md$/

// Best-effort throttles, like otp.js: a recycled instance forgets them, so the
// real protection is the 8-digit code (10^8 guesses) with a 10-minute life.
const ipHits = new Map()
const attemptsBySig = new Map()
let lastCodeSentAt = 0

function config() {
  const token = process.env.GITHUB_TOKEN
  const siteRepo = process.env.GITHUB_REPO || 'SaisatwikBiku/my-portfolio-page'
  const siteBranch = process.env.GITHUB_BRANCH || 'main'
  const draftsRepo = process.env.DRAFTS_REPO
  const site = { client: repoClient({ token, repo: siteRepo, branch: siteBranch }), dir: SITE_DIR }
  const drafts = draftsRepo
    ? { client: repoClient({ token, repo: draftsRepo, branch: process.env.DRAFTS_BRANCH || 'main' }), dir: DRAFTS_DIR }
    : site
  return {
    secret: process.env.OTP_SECRET,
    email: String(process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    token,
    stores: { site, drafts },
    draftsPrivate: Boolean(draftsRepo),
  }
}

// ---------- signing & cookies ----------

const hmac = (secret, message) => crypto.createHmac('sha256', secret).update(message).digest('base64url')

function safeEqual(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

// The admin email is part of every signature, so changing ADMIN_EMAIL (or
// OTP_SECRET) signs everyone out.
const sessionSig = (cfg, exp) => hmac(cfg.secret, `blog-admin-session|${cfg.email}|${exp}`)
const codeSig = (cfg, code, exp) => hmac(cfg.secret, `blog-admin-login|${cfg.email}|${code}|${exp}`)

function readCookie(req, name) {
  for (const part of String(req.headers.cookie || '').split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return ''
}

function isSignedIn(req, cfg, now) {
  const [expPart, sig] = readCookie(req, COOKIE).split('.')
  const exp = Number(expPart)
  return Boolean(sig) && Number.isFinite(exp) && now < exp && safeEqual(sig, sessionSig(cfg, exp))
}

function setSessionCookie(req, res, value, maxAgeSeconds) {
  // Secure everywhere except plain-http local dev, where the browser would
  // otherwise drop the cookie.
  const host = String(req.headers.host || '')
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${value}; Path=/api/admin; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict${local ? '' : '; Secure'}`,
  )
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded || '').split(',')[0].trim()
  return first || req.socket?.remoteAddress || 'unknown'
}

function maskEmail(email) {
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(1, user.length - 2))}@${domain}`
}

// ---------- sign-in ----------

async function requestCode(req, res, cfg, now) {
  const ip = clientIp(req)
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < IP_WINDOW_MS)
  if (hits.length >= MAX_CODES_PER_IP) {
    return sendJson(res, 429, { error: 'Too many codes requested. Try again later.' })
  }
  if (now - lastCodeSentAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - lastCodeSentAt)) / 1000)
    return sendJson(res, 429, { error: `Wait ${wait}s before requesting another code.` })
  }

  const code = String(crypto.randomInt(0, 100_000_000)).padStart(8, '0')
  const exp = now + CODE_TTL_MS
  const mail = emailjsConfig()
  const echo = process.env.OTP_DEV_ECHO === '1'
  if (echo) console.log(`[admin] sign-in code: ${code}`)

  if (mail.templateId && mail.privateKey) {
    try {
      await sendPasscodeEmail(mail, {
        email: cfg.email,
        name: 'Sai',
        code,
        minutes: Math.round(CODE_TTL_MS / 60000),
      })
    } catch (err) {
      console.error('Admin sign-in email failed', err)
      return sendJson(res, 502, { error: "Couldn't send the code. Try again in a moment." })
    }
  } else if (!echo) {
    return sendJson(res, 500, { error: 'Email is not configured (EMAILJS_OTP_TEMPLATE_ID, EMAILJS_PRIVATE_KEY).' })
  }

  ipHits.set(ip, [...hits, now])
  lastCodeSentAt = now
  return sendJson(res, 200, {
    token: `${exp}.${codeSig(cfg, code, exp)}`,
    sentTo: maskEmail(cfg.email),
    resendAfter: now + RESEND_COOLDOWN_MS,
  })
}

function verifyCode(req, res, cfg, body, now) {
  const [expPart, sig] = String(body.token ?? '').split('.')
  const exp = Number(expPart)
  const code = String(body.code ?? '').replace(/\s/g, '')
  if (!sig || !Number.isFinite(exp)) return sendJson(res, 400, { error: 'Request a new code.' })
  if (now > exp) return sendJson(res, 400, { error: 'That code expired. Request a new one.', expired: true })
  if (!/^\d{8}$/.test(code)) return sendJson(res, 400, { error: 'Enter the 8-digit code from the email.' })

  for (const [s, entry] of attemptsBySig) if (now > entry.exp) attemptsBySig.delete(s)
  const record = attemptsBySig.get(sig) ?? { count: 0, exp }
  if (record.count >= MAX_ATTEMPTS) {
    return sendJson(res, 429, { error: 'Too many wrong attempts. Request a new code.', expired: true })
  }
  if (!safeEqual(sig, codeSig(cfg, code, exp))) {
    record.count += 1
    attemptsBySig.set(sig, record)
    const left = MAX_ATTEMPTS - record.count
    return sendJson(res, 400, {
      error: left > 0 ? `Wrong code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many wrong attempts. Request a new code.',
      expired: left <= 0,
    })
  }

  attemptsBySig.delete(sig)
  const sessionExp = now + SESSION_TTL_MS
  setSessionCookie(req, res, `${sessionExp}.${sessionSig(cfg, sessionExp)}`, SESSION_TTL_MS / 1000)
  return sendJson(res, 200, { signedIn: true })
}

// ---------- posts ----------

// Where a post lives. The client only ever names a store and a path that the
// server handed it; both are re-checked here so a crafted request can't read or
// write anything outside the two post folders.
function locate(cfg, ref) {
  const store = ref?.store === 'site' ? cfg.stores.site : ref?.store === 'drafts' ? cfg.stores.drafts : null
  const path = String(ref?.path ?? '')
  const name = path.slice(store?.dir.length + 1)
  if (!store || !path.startsWith(`${store.dir}/`) || !POST_FILE_RE.test(name)) return null
  return { store, path }
}

// Anything in the drafts store is a draft; a file in the site repo is one only
// if it says so (always true in shared mode, and possible in private mode for
// drafts written by hand before DRAFTS_REPO was set).
const isDraft = (storeName, data) => storeName === 'drafts' || data.draft === true

function summarize(storeName, file, text) {
  const { data } = parseFrontmatter(text)
  const draft = isDraft(storeName, data)
  return {
    store: storeName,
    path: file.path,
    sha: file.sha,
    slug: data.slug || slugFromPath(file.name),
    title: data.title || slugFromPath(file.name),
    date: data.date || '',
    summary: data.summary || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft,
  }
}

async function listStore(cfg, storeName) {
  const { client, dir } = cfg.stores[storeName]
  const files = (await client.list(dir)).filter((f) => POST_FILE_RE.test(f.name))
  return Promise.all(
    files.map(async (f) => {
      const file = await client.read(f.path)
      return summarize(storeName, f, file?.text ?? '')
    }),
  )
}

async function listPosts(cfg) {
  const site = await listStore(cfg, 'site')
  const drafts = cfg.draftsPrivate ? await listStore(cfg, 'drafts') : []
  // In shared mode drafts are the site files marked draft; report them under
  // the drafts store so the client handles both modes the same way.
  const all = [...site.map((p) => (p.draft && !cfg.draftsPrivate ? { ...p, store: 'drafts' } : p)), ...drafts]
  return all.sort((a, b) => b.date.localeCompare(a.date))
}

async function getPost(cfg, ref) {
  const loc = locate(cfg, ref)
  if (!loc) return null
  const file = await loc.store.client.read(loc.path)
  if (!file) return null
  const { data, body } = parseFrontmatter(file.text)
  return {
    store: ref.store,
    path: loc.path,
    sha: file.sha,
    draft: isDraft(ref.store, data),
    title: data.title || '',
    slug: data.slug || slugFromPath(loc.path),
    date: data.date || '',
    summary: data.summary || '',
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    cover: data.cover || '',
    body: body.replace(/^(\s*\n)+/, ''),
  }
}

function cleanPost(input) {
  const post = {
    title: String(input?.title ?? '').trim().slice(0, 200),
    slug: String(input?.slug ?? '').trim(),
    date: String(input?.date ?? '').trim(),
    summary: String(input?.summary ?? '').trim().slice(0, 500),
    tags: [...new Set((Array.isArray(input?.tags) ? input.tags : []).map((t) => String(t).trim().toLowerCase()))],
    cover: String(input?.cover ?? '').trim(),
    body: String(input?.body ?? ''),
  }
  if (!post.title) return { error: 'Give the post a title.' }
  if (!SLUG_RE.test(post.slug) || post.slug.length > 80) return { error: 'The URL slug can only use a-z, 0-9 and single dashes.' }
  if (!DATE_RE.test(post.date) || Number.isNaN(Date.parse(post.date))) return { error: 'The date must be YYYY-MM-DD.' }
  if (post.tags.length > 12 || post.tags.some((t) => !TAG_RE.test(t) || t.length > 30)) {
    return { error: 'Tags can only use a-z, 0-9 and dashes (12 at most).' }
  }
  if (post.cover && !/^\/blog\/[\w./-]+$/.test(post.cover)) return { error: 'The cover must be an uploaded image.' }
  if (post.body.length > 400_000) return { error: 'The post body is too long.' }
  return { post }
}

// Saves a post as a draft or publishes it. When the store or filename changes
// (publishing a draft, unpublishing, or editing the date or slug) the new file
// is written first and the old one removed after, so a failure in between
// leaves a duplicate rather than losing the post.
async function savePost(cfg, body) {
  const { post, error } = cleanPost(body.post)
  if (error) return { status: 400, error }
  const publish = body.publish === true
  const targetName = publish ? 'site' : 'drafts'
  const target = cfg.stores[targetName]
  const path = `${target.dir}/${post.date}-${post.slug}.md`

  const original = body.original ? locate(cfg, body.original) : null
  if (body.original && !original) return { status: 400, error: 'Unknown post.' }
  const samePlace = original && original.store === target && original.path === path

  // A slug is the post's URL, so it has to be unique across drafts and
  // published posts, whatever date prefix the files carry.
  const stores = cfg.draftsPrivate ? [cfg.stores.site, cfg.stores.drafts] : [cfg.stores.site]
  for (const store of stores) {
    for (const f of await store.client.list(store.dir)) {
      if (!POST_FILE_RE.test(f.name)) continue
      const isOriginal = original && original.store === store && original.path === f.path
      if (!isOriginal && slugFromPath(f.name) === post.slug) {
        return { status: 409, error: `Another post already uses /blog/${post.slug}. Pick a different slug.` }
      }
    }
  }

  const text = stringifyPost({ ...post, draft: !publish }, post.body)
  const verb = publish ? (body.original?.store === 'site' && !body.original.draft ? 'Update' : 'Publish') : 'Save draft'
  const message = `blog: ${verb} "${post.title}"`

  const written = await target.client.write(path, {
    text,
    sha: samePlace ? body.original.sha : undefined,
    message,
  })
  if (original && !samePlace) {
    await original.store.client.remove(original.path, { sha: body.original.sha, message: `blog: Move "${post.title}"` })
  }
  return { status: 200, saved: { store: targetName, path, sha: written.sha, draft: !publish } }
}

async function deletePost(cfg, ref) {
  const loc = locate(cfg, ref)
  if (!loc) return { status: 400, error: 'Unknown post.' }
  await loc.store.client.remove(loc.path, { sha: String(ref.sha ?? ''), message: `blog: Delete ${loc.path.split('/').pop()}` })
  return { status: 200 }
}

// Images are committed to the public site repo under public/blog/<slug>/, so
// they're served from the site once the next deploy finishes.
async function uploadImage(cfg, body) {
  const slug = String(body.slug ?? '')
  if (!SLUG_RE.test(slug)) return { status: 400, error: 'Set the post slug before adding images.' }
  const ext = IMAGE_TYPES[String(body.filename ?? '').split('.').pop().toLowerCase()]
  if (!ext) return { status: 400, error: 'Images must be PNG, JPG, WebP, GIF or AVIF.' }
  const data = String(body.data ?? '')
  if (!/^[A-Za-z0-9+/]+=*$/.test(data)) return { status: 400, error: 'Image data is corrupt.' }
  if (Math.floor((data.length * 3) / 4) > MAX_IMAGE_BYTES) return { status: 413, error: 'Images must be under 3 MB.' }

  const base = slugifyFilename(String(body.filename)) || 'image'
  const name = `${Date.now().toString(36)}-${base}.${ext}`
  const path = `${IMAGE_DIR}/${slug}/${name}`
  await cfg.stores.site.client.write(path, { base64: data, message: `blog: Add image ${name}` })
  return { status: 200, url: `/blog/${slug}/${name}` }
}

function slugifyFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

// ---------- entry ----------

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  // Custom header + no CORS headers: a cross-site page can't send it without a
  // preflight this endpoint never approves. SameSite=Strict covers the rest.
  if (req.headers['x-blog-admin'] !== '1') return sendJson(res, 403, { error: 'Forbidden' })

  const cfg = config()
  if (!cfg.secret || !cfg.email) {
    console.error('Blog admin needs OTP_SECRET and ADMIN_EMAIL')
    return sendJson(res, 500, { error: 'The editor is not configured (OTP_SECRET, ADMIN_EMAIL).' })
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' })
  }

  const now = Date.now()
  const action = body.action

  if (action === 'session') {
    return sendJson(res, 200, { signedIn: isSignedIn(req, cfg, now), draftsPrivate: cfg.draftsPrivate })
  }
  if (action === 'request-code') return requestCode(req, res, cfg, now)
  if (action === 'verify-code') return verifyCode(req, res, cfg, body, now)
  if (action === 'sign-out') {
    setSessionCookie(req, res, '', 0)
    return sendJson(res, 200, { signedIn: false })
  }

  // Everything below changes or reveals content.
  if (!isSignedIn(req, cfg, now)) return sendJson(res, 401, { error: 'Sign in again.', signedOut: true })
  if (!cfg.token) return sendJson(res, 500, { error: 'GITHUB_TOKEN is not set.' })

  try {
    if (action === 'list') return sendJson(res, 200, { posts: await listPosts(cfg), draftsPrivate: cfg.draftsPrivate })
    if (action === 'get') {
      const post = await getPost(cfg, body)
      return post ? sendJson(res, 200, { post }) : sendJson(res, 404, { error: 'Post not found.' })
    }
    const result =
      action === 'save' ? await savePost(cfg, body)
      : action === 'delete' ? await deletePost(cfg, body)
      : action === 'upload' ? await uploadImage(cfg, body)
      : { status: 400, error: 'Unknown action' }
    const { status, ...payload } = result
    return sendJson(res, status, payload)
  } catch (err) {
    if (err instanceof GitHubError && (err.status === 409 || err.status === 422)) {
      return sendJson(res, 409, {
        error: 'This post changed on GitHub since you opened it. Copy your text, reload, and reapply it.',
      })
    }
    console.error('Blog admin failed', err)
    return sendJson(res, 502, { error: err instanceof GitHubError ? `GitHub: ${err.message}` : 'Something went wrong.' })
  }
}
