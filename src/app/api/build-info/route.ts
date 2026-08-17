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
  /**
   * Whether this deployment was actually given its configuration.
   *
   * WHY THIS IS WORTH REPORTING
   * "Editing is not set up on this site yet" is one message for three
   * different causes: the password missing, the signing secret missing, or the
   * secret being present but too short to sign with — which fails in exactly
   * the same way while looking correctly configured in the dashboard. From
   * outside the deployment there is no way to tell which, and the obvious
   * guess (that the variables were never added) is wrong as often as it is
   * right, because they may have been added without redeploying.
   *
   * Booleans only, never values. It reveals that the site has an editor, which
   * `/edit` already announces, and nothing that helps anyone get into it.
   *
   * Read per request rather than at module scope, so it describes the running
   * function rather than the moment it was built.
   */
  const secret = process.env.EDITOR_SESSION_SECRET ?? ''

  return NextResponse.json(
    {
      sha: BUILT_FROM,
      configured: {
        password: Boolean(process.env.EDITOR_PASSWORD),
        secret: Boolean(secret),
        /** Under 32 characters is refused, and fails identically to missing. */
        secretLongEnough: secret.length >= 32,
        /** Only needed to publish; sign-in works without it. */
        publishing: Boolean(process.env.GITHUB_TOKEN),
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
