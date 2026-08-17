import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE, cookieOptions } from '@/lib/editorAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The way out.
 *
 * Without this, ending a session means clearing a cookie by hand — which is
 * precisely the thing a client signing in at /edit should never have to know
 * about. It matters most on a shared or borrowed machine, where the
 * alternative is a live homepage left editable behind them.
 *
 * Expired rather than deleted, with the same path and flags it was set with:
 * a `delete` that disagrees with the original attributes can silently leave
 * the cookie in place.
 */
export async function POST() {
  const jar = await cookies()
  jar.set(COOKIE, '', { ...cookieOptions, maxAge: 0 })

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
