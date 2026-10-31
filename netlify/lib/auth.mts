import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_MS = 4 * 60 * 60 * 1000 // 4 hours

function getPassword(): string | undefined {
  return Netlify.env.get('ADMIN_PASSWORD') || undefined
}

function sign(payload: string, password: string): string {
  return createHmac('sha256', `bukaldev-admin:${password}`).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export function isConfigured(): boolean {
  return Boolean(getPassword())
}

export function checkPassword(candidate: string): boolean {
  const password = getPassword()
  if (!password || typeof candidate !== 'string') return false
  // Compare fixed-length digests so the password length isn't leaked
  const a = createHmac('sha256', 'pw').update(candidate).digest()
  const b = createHmac('sha256', 'pw').update(password).digest()
  return timingSafeEqual(a, b)
}

export function createToken(): { token: string; expiresAt: number } {
  const password = getPassword()!
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload = String(expiresAt)
  return { token: `${payload}.${sign(payload, password)}`, expiresAt }
}

export function isAuthorized(req: Request): boolean {
  const password = getPassword()
  const header = req.headers.get('authorization') || ''
  if (!password || !header.startsWith('Bearer ')) return false

  const [payload, signature] = header.slice(7).split('.')
  if (!payload || !signature) return false
  if (!safeEqual(signature, sign(payload, password))) return false

  return Number(payload) > Date.now()
}
