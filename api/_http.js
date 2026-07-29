// Request/response plumbing shared by the serverless functions in this folder.
// Vercel does not route files prefixed with `_`, so this stays a plain library.

// Reads and parses a JSON body when the platform hasn't already done it
// (Vercel pre-parses req.body; the Vite dev middleware does not).
export async function readJsonBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

export function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}
