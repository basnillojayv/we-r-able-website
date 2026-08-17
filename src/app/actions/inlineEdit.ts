'use server'

import { getEditor } from '@/lib/editorAuth'
import { applyEdits, type Edit } from '@/lib/applyEdits'

export type { Edit }

type Result = { ok: true; count: number; sha?: string } | { ok: false; error: string }

/**
 * Where the content lives.
 *
 * INSTALL: set EDITOR_REPO to "owner/name". None of this is secret — it is an
 * environment variable only so the same build can point at a fork.
 */
const REPO = process.env.EDITOR_REPO ?? ''
const BRANCH = process.env.EDITOR_BRANCH ?? 'main'
const FILE = process.env.EDITOR_CONTENT_FILE ?? 'src/content/copy.json'

const api = (path: string, init?: RequestInit) =>
  fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'inline-editor-git',
      ...(init?.headers ?? {}),
    },
  })

type Loaded = { doc: Record<string, unknown>; sha: string }

/**
 * Read the live content file from GitHub — deliberately not the bundled
 * `copy.json` import.
 *
 * That import is frozen at this deployment's build. Two saves inside the same
 * deploy window would both be computed against pre-first-save content, and the
 * second would quietly overwrite the first: a data loss that only appears
 * under exactly the usage this feature invites. Reading here also yields the
 * blob sha the write needs.
 */
async function load(): Promise<Loaded | { error: string }> {
  const response = await api(`contents/${FILE}?ref=${BRANCH}`)

  if (response.status === 401 || response.status === 403) {
    return { error: 'The publishing key was rejected. It may have expired.' }
  }
  if (response.status === 404) {
    return { error: 'Could not find the content file in the repository.' }
  }
  if (!response.ok) {
    return { error: 'GitHub could not be reached. Nothing was saved — try again.' }
  }

  const body = await response.json()
  // Files over 1MB come back without `content`. copy.json is a few KB, but a
  // clear message beats a TypeError if that ever changes.
  if (typeof body?.content !== 'string' || typeof body?.sha !== 'string') {
    return { error: 'The content file could not be read from the repository.' }
  }

  return {
    doc: JSON.parse(Buffer.from(body.content, 'base64').toString('utf8')),
    sha: body.sha,
  }
}

/**
 * Apply a batch of edits and publish them.
 *
 * Publishing means committing the content file to `main`; the repository's
 * existing deploy carries it to the live site, about a minute later. There is
 * no staging step, which is why the button still says Save.
 */
export async function saveEdits(edits: Edit[]): Promise<Result> {
  /**
   * First, and not a formality: a server action is a public endpoint. Anyone
   * who can POST can call this, so the check cannot live in the toolbar.
   */
  const { canEdit } = await getEditor()
  if (!canEdit) return { ok: false, error: 'Not allowed.' }

  if (edits.length === 0) return { ok: true, count: 0 }

  if (!process.env.GITHUB_TOKEN || !REPO) {
    return { ok: false, error: 'Publishing is not set up on this site yet.' }
  }

  /**
   * A stale sha means someone else moved the file between the read and the
   * write — a second tab, or a developer pushing. Re-read and re-apply rather
   * than overwrite, which is safe precisely because every edit is a
   * last-write-wins assignment onto whatever is currently there, and an edit
   * whose path has vanished is dropped rather than reinstated.
   */
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const loaded = await load()
    if ('error' in loaded) return { ok: false, error: loaded.error }

    const before = JSON.stringify(loaded.doc)
    const applied = applyEdits(loaded.doc, edits)

    // Nothing changed: do not spend a commit, a rebuild and a minute of
    // "publishing…" on output that would be identical.
    if (applied === 0 || JSON.stringify(loaded.doc) === before) {
      return { ok: true, count: 0 }
    }

    const next = JSON.stringify(loaded.doc, null, 2) + '\n'
    const message =
      `Copy edit: ${applied} change${applied === 1 ? '' : 's'} from the in-place editor\n\n` +
      edits.map((edit) => edit.key).join('\n')

    const response = await api(`contents/${FILE}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: Buffer.from(next, 'utf8').toString('base64'),
        sha: loaded.sha,
        branch: BRANCH,
      }),
    })

    if (response.ok) {
      const body = await response.json()
      // The commit sha, not `content.sha` — the latter is the blob hash and
      // would never match what the deployment reports it was built from.
      return { ok: true, count: applied, sha: body?.commit?.sha }
    }

    // 409 is the documented conflict; 422 shows up for the same cause.
    if (response.status === 409 || response.status === 422) {
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)))
      continue
    }

    if (response.status === 401 || response.status === 403) {
      return { ok: false, error: 'The publishing key was rejected. It may have expired.' }
    }

    return { ok: false, error: 'GitHub could not be reached. Nothing was saved — try again.' }
  }

  /**
   * Accurate rather than reassuring: EditBar only clears the pending map on
   * success, so the edits really are still on screen and pressing Save again
   * really does work.
   */
  return {
    ok: false,
    error: 'Someone saved at the same moment. Your changes are still here — press Save again.',
  }
}
