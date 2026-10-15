// Client for /api/admin. Every call is a POST with the action in the body, the
// same shape otp.js uses; the X-Blog-Admin header is the server's CSRF check.
export class AdminError extends Error {
  constructor(message, { status, signedOut } = {}) {
    super(message)
    this.status = status
    this.signedOut = signedOut
  }
}

export async function adminCall(action, payload = {}) {
  let res
  try {
    res = await fetch('/api/admin', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Blog-Admin': '1' },
      body: JSON.stringify({ action, ...payload }),
    })
  } catch {
    throw new AdminError("Couldn't reach the server. Check your connection.")
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new AdminError(data.error || `Request failed (${res.status})`, {
      status: res.status,
      signedOut: data.signedOut,
    })
  }
  return data
}

// Reads a picked/pasted/dropped image, shrinking anything wider than 1800px
// (or heavier than 1.5 MB) to WebP so uploads stay under the 3 MB server cap
// and posts don't ship phone-camera originals. GIFs pass through untouched so
// animations survive.
const MAX_WIDTH = 1800
const SHRINK_OVER_BYTES = 1.5 * 1024 * 1024

export async function prepareImage(file) {
  if (file.type === 'image/gif') return { filename: file.name, data: await toBase64(file), blob: file }

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap || (bitmap.width <= MAX_WIDTH && file.size <= SHRINK_OVER_BYTES)) {
    bitmap?.close()
    return { filename: file.name, data: await toBase64(file), blob: file }
  }
  const scale = Math.min(1, MAX_WIDTH / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
  const filename = `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`
  return { filename, data: await toBase64(blob), blob }
}

function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
