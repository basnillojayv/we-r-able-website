import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE, cookieOptions, editingConfigured, mintSession, passwordMatches } from '@/lib/editorAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/**
 * Errors use Payload's `{ errors: [{ message }] }` envelope on purpose.
 *
 * EditLogin already reads `body?.errors?.[0]?.message`, so matching the shape
 * means that line needs no edit and the wording stays here on the server,
 * where it can say something specific.
 */
const fail = (status: number, message: string) =>
  NextResponse.json({ errors: [{ message }] }, { status, headers: noStore })

/**
 * A fixed delay on every path, success or failure.
 *
 * This is not rate limiting and should not be described as such — see the note
 * in lib/editorAuth.ts. It caps throughput per connection and flattens the
 * timing difference between "no such password" and "wrong password", which is
 * the most that can be done honestly without a shared store.
 */
const settle = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function POST(request: Request) {
  await settle()

  if (!editingConfigured()) {
    return fail(503, 'Editing is not set up on this site yet.')
  }

  let password: unknown
  try {
    password = (await request.json())?.password
  } catch {
    return fail(400, 'That request could not be read.')
  }

  if (typeof password !== 'string' || !(await passwordMatches(password))) {
    return fail(401, 'That password was not recognised.')
  }

  const token = await mintSession()
  if (!token) return fail(503, 'Editing is not set up on this site yet.')

  const jar = await cookies()
  jar.set(COOKIE, token, cookieOptions)

  return NextResponse.json({ ok: true }, { headers: noStore })
}
