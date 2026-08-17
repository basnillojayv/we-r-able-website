/**
 * Which repository and branch the editor commits to.
 *
 * Nothing here is secret, and none of it should have to be configured. Vercel
 * already knows which repository it deployed and which branch it built, and it
 * puts both in the environment — so asking for them again was asking for a
 * variable that can only ever disagree with reality.
 *
 * `EDITOR_REPO` stays as an override for the case Vercel cannot cover: a fork,
 * a monorepo where the content lives elsewhere, or a host that is not Vercel.
 */

export type RepoSource = 'env' | 'vercel' | 'none'

function fromVercel(): string | null {
  const owner = process.env.VERCEL_GIT_REPO_OWNER
  const slug = process.env.VERCEL_GIT_REPO_SLUG
  return owner && slug ? `${owner}/${slug}` : null
}

/** `owner/name`, or null if neither source can say. */
export function editorRepo(): string | null {
  return process.env.EDITOR_REPO?.trim() || fromVercel()
}

/**
 * Where the answer came from. Reported by /api/build-info so a deployment can
 * be asked whether the derivation worked — deliberately without naming the
 * repository, which would be an unnecessary thing to publish on a site whose
 * repo may be private.
 */
export function editorRepoSource(): RepoSource {
  if (process.env.EDITOR_REPO?.trim()) return 'env'
  return fromVercel() ? 'vercel' : 'none'
}

/**
 * The branch to commit to.
 *
 * `VERCEL_GIT_COMMIT_REF` is the branch this deployment was built from, which
 * is the branch whose content is on screen — committing anywhere else would
 * publish an edit the editor cannot then see.
 */
export function editorBranch(): string {
  return process.env.EDITOR_BRANCH?.trim() || process.env.VERCEL_GIT_COMMIT_REF || 'main'
}
