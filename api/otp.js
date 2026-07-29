// Vercel serverless function backing the contact form's email verification.
//
// The passcode is generated here and mailed out here — it never reaches the
// browser, so a visitor can only learn it by opening the inbox they typed in.
// There is no database: the pending code lives inside a signed token,
// `${expiry}.${HMAC(email|code|expiry)}`, which the client holds and hands back
// with whatever it typed. Any instance can verify a code any other instance
// issued, and an expired or tampered token simply fails the HMAC check.
//
// Locally, vite.config.js mounts this same handler at /api/otp.

import crypto from 'node:crypto'
import { readJsonBody, sendJson } from './_http.js'

const CODE_TTL_MS = 10 * 60 * 1000 // a passcode is good for 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000 // one passcode per address per minute
const MAX_ATTEMPTS = 5 // wrong guesses allowed per issued code
const IP_WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_IP = 10 // codes per IP per hour

// Same shape check the form runs client-side: something@something.tld.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Best-effort throttles. A serverless instance can be recycled or a request
// routed to a cold one, which loosens these — they exist to blunt casual abuse,
// while the real guarantees (expiry, tamper-proofing) live in the signed token.
const ipHits = new Map() // ip -> timestamps of recent code requests
const lastSentAt = new Map() // email -> timestamp of last code sent
const attemptsBySig = new Map() // token signature -> { count, exp }

function prune(now) {
  for (const [ip, hits] of ipHits) {
    const fresh = hits.filter((t) => now - t < IP_WINDOW_MS)
    if (fresh.length) ipHits.set(ip, fresh)
    else ipHits.delete(ip)
  }
  for (const [email, t] of lastSentAt) {
    if (now - t > RESEND_COOLDOWN_MS) lastSentAt.delete(email)
  }
  for (const [sig, entry] of attemptsBySig) {
    if (now > entry.exp) attemptsBySig.delete(sig)
  }
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded || '').split(',')[0].trim()
  return first || req.socket?.remoteAddress || 'unknown'
}

function sign(secret, email, code, exp) {
  return crypto.createHmac('sha256', secret).update(`${email}|${code}|${exp}`).digest('base64url')
}

function signaturesMatch(a, b) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

function emailjsConfig() {
  return {
    serviceId: process.env.EMAILJS_SERVICE_ID || 'service_a0t4i5e',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || 'j_PeRhatSYVxAj1Gw',
    templateId: process.env.EMAILJS_OTP_TEMPLATE_ID,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
  }
}

// EmailJS's REST API, rather than the browser SDK the form itself uses: calling
// it from a server needs the private key (Account → API Keys) and "Allow
// EmailJS API for non-browser applications" switched on under Account →
// Security. The OTP template needs {{passcode}}, {{to_email}}, {{to_name}} and
// {{time}}, and must send To = {{to_email}} so the code reaches the visitor.
async function sendPasscodeEmail(cfg, { email, name, code, minutes }) {
  const upstream = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: cfg.serviceId,
      template_id: cfg.templateId,
      user_id: cfg.publicKey,
      accessToken: cfg.privateKey,
      template_params: {
        passcode: code,
        to_email: email,
        to_name: name || 'there',
        time: `${minutes} minutes`,
      },
    }),
  })
  if (!upstream.ok) {
    throw new Error(`EmailJS responded ${upstream.status}: ${await upstream.text()}`)
  }
}

async function handleRequest(req, res, { body, secret, now }) {
  const email = String(body.email ?? '').trim().toLowerCase()
  const name = body.name

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return sendJson(res, 400, { error: 'Please enter a valid email address.' })
  }

  const ip = clientIp(req)
  const hits = ipHits.get(ip) ?? []
  if (hits.length >= MAX_REQUESTS_PER_IP) {
    return sendJson(res, 429, { error: 'Too many codes requested. Please try again later.' })
  }

  const sentAt = lastSentAt.get(email)
  if (sentAt && now - sentAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - sentAt)) / 1000)
    return sendJson(res, 429, { error: `Please wait ${wait}s before requesting another code.` })
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  const exp = now + CODE_TTL_MS
  const minutes = Math.round(CODE_TTL_MS / 60000)

  const cfg = emailjsConfig()
  const echoToConsole = process.env.OTP_DEV_ECHO === '1'
  if (echoToConsole) {
    // Local escape hatch so the flow is testable without a live mail template.
    // Prints to the dev server terminal only — never into the HTTP response.
    console.log(`[otp] passcode for ${email}: ${code}`)
  }

  if (cfg.templateId && cfg.privateKey) {
    try {
      await sendPasscodeEmail(cfg, { email, name: String(name ?? '').slice(0, 100), code, minutes })
    } catch (err) {
      console.error('Passcode email failed', err)
      return sendJson(res, 502, { error: "Couldn't send the code. Please try again in a moment." })
    }
  } else if (!echoToConsole) {
    console.error('OTP email is not configured: set EMAILJS_OTP_TEMPLATE_ID and EMAILJS_PRIVATE_KEY')
    return sendJson(res, 500, { error: 'Email verification is not configured.' })
  }

  ipHits.set(ip, [...hits, now])
  lastSentAt.set(email, now)

  return sendJson(res, 200, {
    token: `${exp}.${sign(secret, email, code, exp)}`,
    expiresAt: exp,
    resendAfter: now + RESEND_COOLDOWN_MS,
  })
}

async function handleVerify(req, res, { body, secret, now }) {
  const email = String(body.email ?? '').trim().toLowerCase()
  const code = String(body.code ?? '').trim()
  const token = String(body.token ?? '')

  const [expPart, sig] = token.split('.')
  const exp = Number(expPart)
  if (!sig || !Number.isFinite(exp)) {
    return sendJson(res, 400, { error: 'Request a new code to continue.' })
  }
  if (now > exp) {
    return sendJson(res, 400, { error: 'That code has expired. Request a new one.', expired: true })
  }
  if (!/^\d{6}$/.test(code)) {
    return sendJson(res, 400, { error: 'Enter the 6-digit code from your inbox.' })
  }

  const record = attemptsBySig.get(sig) ?? { count: 0, exp }
  if (record.count >= MAX_ATTEMPTS) {
    return sendJson(res, 429, { error: 'Too many incorrect attempts. Request a new code.', expired: true })
  }

  if (!signaturesMatch(sig, sign(secret, email, code, exp))) {
    record.count += 1
    attemptsBySig.set(sig, record)
    const left = MAX_ATTEMPTS - record.count
    return sendJson(res, 400, {
      error: left > 0 ? `That code doesn't match. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Request a new code.',
      expired: left <= 0,
    })
  }

  attemptsBySig.delete(sig)
  return sendJson(res, 200, { verified: true })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const secret = process.env.OTP_SECRET
  if (!secret) {
    console.error('OTP_SECRET is not set — passcodes cannot be signed')
    return sendJson(res, 500, { error: 'Email verification is not configured.' })
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' })
  }

  const now = Date.now()
  prune(now)

  // One route, two steps: `request` mails a passcode, `verify` checks one.
  // Vercel maps a single file to a single path, so the step travels in the body
  // rather than as /api/otp/verify.
  const ctx = { body, secret, now }
  try {
    return body.action === 'verify'
      ? await handleVerify(req, res, ctx)
      : await handleRequest(req, res, ctx)
  } catch (err) {
    console.error('OTP handler failed', err)
    return sendJson(res, 500, { error: 'Something went wrong' })
  }
}
