// Thin client for the GitHub contents API, used by admin.js to read and commit
// blog posts. Vercel does not route files prefixed with `_`, so this stays a
// plain library.
//
// GITHUB_TOKEN should be a fine-grained personal access token limited to the
// site repo (and the drafts repo, if there is one) with Contents: read & write.

const API = 'https://api.github.com'

export class GitHubError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function repoClient({ token, repo, branch }) {
  async function call(method, path, body) {
    const res = await fetch(`${API}/repos/${repo}/contents/${encodePath(path)}${method === 'GET' ? `?ref=${encodeURIComponent(branch)}` : ''}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'satwik.info-blog-admin',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify({ ...body, branch }) : undefined,
    })
    if (res.status === 404 && method === 'GET') return null
    const data = res.status === 204 ? null : await res.json().catch(() => null)
    if (!res.ok) {
      throw new GitHubError(res.status, data?.message || `GitHub responded ${res.status}`)
    }
    return data
  }

  return {
    repo,
    // Files in a directory: [{ name, path, sha }]. A missing directory is empty.
    async list(dir) {
      const data = await call('GET', dir)
      return Array.isArray(data) ? data.filter((f) => f.type === 'file') : []
    },
    // A text file's contents and blob sha, or null if it doesn't exist.
    async read(path) {
      const data = await call('GET', path)
      if (!data || Array.isArray(data)) return null
      return { sha: data.sha, text: Buffer.from(data.content, 'base64').toString('utf8') }
    },
    // Creates the file, or updates it when `sha` (the version last read) is
    // given. GitHub rejects a stale sha with 409, which is the editor's
    // protection against overwriting a change made somewhere else.
    async write(path, { text, base64, sha, message }) {
      const content = base64 ?? Buffer.from(text, 'utf8').toString('base64')
      const data = await call('PUT', path, { message, content, ...(sha ? { sha } : {}) })
      return { sha: data.content.sha }
    },
    async remove(path, { sha, message }) {
      await call('DELETE', path, { message, sha })
    },
  }
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}
