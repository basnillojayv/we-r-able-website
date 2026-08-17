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
 *   Signing everyone out means changing EDITOR_PASSWORD, after which every
 *   outstanding cookie fails verification on the next request — because the
 *   signing key is derived from it.
 * - **The password is stored in plaintext in the environment.** Hashing it
 *   would protect nothing here: the cookie's signing key is derived from the
 *   password, so anyone who can read the environment can mint a valid session
 *   whether or not they can reverse a hash.
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

/**
 * Derived once. The environment does not change under a running function, and
 * HKDF on every cookie check would be work for nothing.
 */
let cachedKey: Promise<CryptoKey | null> | null = null

/**
 * The key the session cookie is signed with.
 *
 * Derived from EDITOR_PASSWORD unless EDITOR_SESSION_SECRET is set explicitly.
 * That removes a second variable, and with it the trap it carried: a secret
 * shorter than 32 characters used to be refused and fail *identically* to one
 * that was missing, while looking perfectly set in the dashboard.
 *
 * Deriving is sound here because the password is the only credential anyway —
 * anyone holding it can sign in and mint their own cookie, so a separate secret
 * protected nothing that was not already lost. It has to be high-entropy for
 * that reason regardless; there is no rate limiting to fall back on.
 *
 * A welcome consequence: changing the password now invalidates every
 * outstanding session, which is what "sign everyone out" should mean and
 * previously took rotating a second value.
 *
 * The salt is fixed and not secret. HKDF wants a salt for domain separation,
 * not for secrecy, and the input keying material already carries the entropy.
 */
async function deriveKey(): Promise<CryptoKey | null> {
  const explicit = process.env.EDITOR_SESSION_SECRET?.trim()

  if (explicit) {
    if (explicit.length < 32) return null
    return crypto.subtle.importKey(
      'raw',
      encoder.encode(explicit),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    )
  }

  const password = process.env.EDITOR_PASSWORD
  if (!password) return null

  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'HKDF', false, [
    'deriveKey',
  ])

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: encoder.encode('inline-editor-git/session/v1'),
      info: encoder.encode('cookie-signing'),
    },
    material,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign', 'verify'],
  )
}

function signingKey(): Promise<CryptoKey | null> {
  cachedKey ??= deriveKey()
  return cachedKey
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

/**
 * Passwords that are fine for building and dangerous for a client site.
 *
 * There is no rate limiting and cannot be, so a guessable password is the whole
 * of the security. And since the cookie's signing key is derived from it, a weak
 * password is also a weak signing key.
 *
 * This exists because "use something strong before handover" is the kind of
 * intention that gets forgotten. Reported by /api/build-info and shown standing
 * in the toolbar, so the site says it rather than someone having to remember.
 */
const OBVIOUS = new Set([
  'letmein2o26',
  'letmein',
  'letmein2026',
  'password',
  'password123',
  'admin',
  'changeme',
  'editor',
  'test1234',
  'secret',
])

/** Under 16 characters, or a password anyone would try first. */
export function passwordIsWeak(): boolean {
  const password = process.env.EDITOR_PASSWORD ?? ''
  if (!password) return false // absent is reported separately, not as "weak"
  return password.length < 16 || OBVIOUS.has(password.toLowerCase())
}

/**
 * One value, not two. The signing key comes from the password unless an
 * explicit EDITOR_SESSION_SECRET overrides it.
 */
export function editingConfigured(): boolean {
  return Boolean(process.env.EDITOR_PASSWORD)
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
