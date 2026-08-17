import 'server-only'
import { cookies } from 'next/headers'

/**
 * Who may edit.
 *
 * The Payload original asked the CMS to resolve a session from the request
 * headers. There is no CMS and no user table here, so a session is a signed
 * cookie and an editor is anyone holding the shared passphrase.
 *
 * WHAT THIS DESIGN DOES NOT HAVE, stated rather than implied:
 *
 * - **No rate limiting.** One shared password on a public endpoint, running on
 *   serverless with no shared store, cannot be rate limited honestly — an
 *   in-memory counter is per-instance and a new instance is always available.
 *   The defence is passphrase entropy, not a lockout. Use five words, not a
 *   short password.
 * - **No revocation list.** There is nowhere to record that a cookie is dead.
 *   Signing everyone out means rotating EDITOR_SESSION_SECRET, after which
 *   every outstanding cookie fails verification on the next request.
 * - **The password is stored in plaintext in the environment.** Hashing it
 *   would protect nothing: the same environment holds the signing secret, and
 *   anyone holding that can mint a valid cookie without knowing the password
 *   at all.
 *
 * IMPORTANT: this module calls `cookies()`, a Dynamic API. It must be imported
 * *only* by route handlers and server actions — never by anything reachable
 * from `layout.tsx` or `page.tsx`, or `/` stops being statically prerendered,
 * which is the property the whole design exists to protect.
 */

export const COOKIE = 'pb_editor'

/** Absolute, not sliding. One person editing a portfolio does not need a
 *  refresh-on-use window, and a second piece of state is a second thing to
 *  get wrong. */
const TTL_MS = 12 * 60 * 60 * 1000

const VERSION = 'v1'
const encoder = new TextEncoder()

async function signingKey(): Promise<CryptoKey | null> {
  const secret = process.env.EDITOR_SESSION_SECRET
  // A short secret is a misconfiguration, not a weak setting — refuse it
  // rather than sign with it.
  if (!secret || secret.length < 32) return null

  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

/**
 * `v1.<expiry ms>.<base64url hmac>`
 *
 * The expiry is inside the signed payload, so a cookie whose Max-Age the
 * browser chose to ignore is still refused here.
 */
export async function mintSession(now = Date.now()): Promise<string | null> {
  const key = await signingKey()
  if (!key) return null

  const payload = `${VERSION}.${now + TTL_MS}`
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return `${payload}.${Buffer.from(signature).toString('base64url')}`
}

async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [version, expiry, signature] = parts
  if (version !== VERSION) return false

  const key = await signingKey()
  if (!key) return false

  let bytes: Uint8Array<ArrayBuffer>
  try {
    // Copied into a freshly allocated ArrayBuffer rather than handed over as a
    // Buffer: Buffer's backing store is typed ArrayBufferLike, which may be a
    // SharedArrayBuffer, and WebCrypto will not accept one.
    const raw = Buffer.from(signature, 'base64url')
    bytes = new Uint8Array(new ArrayBuffer(raw.length))
    bytes.set(raw)
  } catch {
    return false
  }
  if (bytes.length !== 32) return false

  // crypto.subtle.verify compares in constant time. Do not be tempted to
  // recompute the signature and `===` it against the cookie.
  const signed = await crypto.subtle.verify('HMAC', key, bytes, encoder.encode(`${version}.${expiry}`))
  if (!signed) return false

  // Only once the signature is trusted is the expiry worth reading at all.
  const expiresAt = Number(expiry)
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

/**
 * Constant-time password check.
 *
 * Both sides are hashed to a fixed 32 bytes first, so neither the length nor
 * the content of a guess can be read out of how long the comparison took.
 */
export async function passwordMatches(guess: string): Promise<boolean> {
  const actual = process.env.EDITOR_PASSWORD
  // Unset means nobody gets in — never means everybody does.
  if (!actual) return false

  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(guess)),
    crypto.subtle.digest('SHA-256', encoder.encode(actual)),
  ])

  const x = new Uint8Array(a)
  const y = new Uint8Array(b)
  let difference = 0
  for (let i = 0; i < x.length; i += 1) difference |= x[i] ^ y[i]
  return difference === 0
}

export const cookieOptions = {
  httpOnly: true,
  /**
   * Lax rather than Strict: the cookie still rides a top-level navigation, so
   * arriving at /edit from a bookmark or an emailed link keeps the session.
   * The write path's CSRF defence is Next's own Server Action origin check,
   * not this flag.
   */
  sameSite: 'lax' as const,
  // Safari refuses Secure cookies on http://localhost, which would make the
  // whole thing untestable in `next dev`.
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: TTL_MS / 1000,
}

export function editingConfigured(): boolean {
  return Boolean(process.env.EDITOR_PASSWORD && process.env.EDITOR_SESSION_SECRET)
}

/**
 * The exact replacement for the Payload version: same signature, and the same
 * never-throws contract. A misconfigured secret costs the edit bar, not the
 * page.
 */
export async function getEditor(): Promise<{ canEdit: boolean }> {
  try {
    const jar = await cookies()
    return { canEdit: await verifySession(jar.get(COOKIE)?.value) }
  } catch {
    return { canEdit: false }
  }
}
