import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Which commit this deployment was built from.
 *
 * Saving commits to `main` and the site rebuilds, so "is my change live yet?"
 * is answerable by asking the site what it was built from and watching for it
 * to change. Read at build time and frozen into the bundle — that is precisely
 * what makes it a usable stamp.
 *
 * `null` in local development, where nothing is deployed and nothing rebuilds.
 * The toolbar treats that as "cannot tell", which is the truth.
 */
const BUILT_FROM = process.env.VERCEL_GIT_COMMIT_SHA ?? null

export function GET() {
  return NextResponse.json({ sha: BUILT_FROM }, { headers: { 'Cache-Control': 'no-store' } })
}
