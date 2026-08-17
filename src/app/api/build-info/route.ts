import { NextResponse } from 'next/server'
import { editingConfigured, passwordIsWeak } from '@/lib/editorAuth'
import { editorBranch, editorRepoSource } from '@/lib/editorRepo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Which commit this deployment was built from.
 *
 * Saving commits to the branch and the site rebuilds, so "is my change live
 * yet?" is answerable by asking the site what it was built from and watching
 * for it to change. Read at build time and frozen into the bundle — that is
 * precisely what makes it a usable stamp.
 *
 * `null` in local development, where nothing is deployed and nothing rebuilds.
 * The toolbar treats that as "cannot tell", which is the truth.
 */
const BUILT_FROM = process.env.VERCEL_GIT_COMMIT_SHA ?? null

export function GET() {
  /**
   * Whether this deployment can actually do the job.
   *
   * WHY THIS IS WORTH REPORTING
   * Setup failures here are invisible from the outside and identical from the
   * inside: a missing token and a missing repository both surface as one
   * sentence at Save, after someone has already done the work. This turns
   * "it does not work" into a question with an answer.
   *
   * Booleans and a source name, never values. `repo` says *where the answer
   * came from* rather than what it is — enough to tell whether the derivation
   * from Vercel's own git variables worked, without publishing the name of a
   * repository that may be private.
   */
  return NextResponse.json(
    {
      sha: BUILT_FROM,
      configured: {
        /** EDITOR_PASSWORD. The signing key is derived from it. */
        password: editingConfigured(),
        /** A build-and-test password still in place. Not a secret to withhold:
         *  anyone can already try one, and the point is that it gets noticed. */
        passwordWeak: passwordIsWeak(),
        /** GITHUB_TOKEN. Without it the editor can edit but never save. */
        publishing: Boolean(process.env.GITHUB_TOKEN),
        /**
         * A token that is not fine-grained.
         *
         * Fine-grained tokens begin `github_pat_`; an OAuth (`gho_`) or classic
         * (`ghp_`) one does not, and carries far more than write access to one
         * repository — commonly `repo`, `workflow` and `delete_repo` across
         * every repository the account owns. Convenient to start with, wrong to
         * leave sitting in a client site's environment.
         */
        tokenBroad:
          Boolean(process.env.GITHUB_TOKEN) &&
          !process.env.GITHUB_TOKEN!.startsWith('github_pat_'),
        /** 'vercel' means nothing had to be configured. */
        repo: editorRepoSource(),
        branch: editorBranch(),
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
