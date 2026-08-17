'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEdit } from './EditProvider'
import { saveEdits } from '../actions/inlineEdit'

/**
 * The in-place editor's toolbar, for signed-in staff only.
 *
 * Says Save rather than Publish deliberately. There is no draft and no staging
 * step: pressing it commits to the live site's `main` branch and cannot be
 * taken back from here. "Publish" would imply an approval gate that does not
 * exist, and someone who believes their change is staged is someone who types
 * something careless onto a live page.
 *
 * The delay is in *delivery*, not approval — the change is committed at once
 * and reaches the site when the rebuild finishes, about a minute later. That
 * belongs in the status line, which says so, and not in the button.
 *
 * The green dot answers "am I editing right now?" without reading a word, which
 * is what stops someone typing into the page by accident.
 */

/**
 * How long to keep asking whether the new build has landed. Past this the
 * answer is "still going", never "failed" — the commit did land, and it will
 * deploy.
 */
const PUBLISH_TIMEOUT_MS = 3 * 60 * 1000
const PUBLISH_POLL_MS = 5000

type Publishing = { sha?: string; before: string | null; since: number }

async function buildInfo(): Promise<{ sha: string | null; canPublish: boolean }> {
  try {
    const response = await fetch('/api/build-info', { cache: 'no-store' })
    if (!response.ok) return { sha: null, canPublish: true }
    const body = await response.json()
    return {
      sha: body?.sha ?? null,
      /**
       * Absent on an older deployment that predates the field. Treated as
       * "probably fine" rather than "broken", because a false warning about
       * something that works is its own kind of lie.
       */
      canPublish: body?.configured?.publishing !== false,
    }
  } catch {
    return { sha: null, canPublish: true }
  }
}

async function builtFrom(): Promise<string | null> {
  return (await buildInfo()).sha
}
export function EditBar() {
  const edit = useEdit()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [publishing, setPublishing] = useState<Publishing | null>(null)
  /**
   * Whether a save can go anywhere.
   *
   * The token is the last thing installed and the easiest to forget, and until
   * now the only way to find out it was missing was to do the work and press
   * Save. An editor that cannot save has to say so before it is used, not
   * after — otherwise someone forms an opinion about whether the tool works
   * while looking at a configuration problem.
   *
   * Starts true so a working site never flashes a warning it will retract.
   */
  const [canPublish, setCanPublish] = useState(true)

  useEffect(() => {
    let cancelled = false
    void buildInfo().then((info) => {
      if (!cancelled) setCanPublish(info.canPublish)
    })
    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Edits are held in memory until Save, so leaving the page would lose them
   * silently. The browser's own prompt is the only thing that reliably fires on
   * tab close.
   */
  useEffect(() => {
    if (!edit?.dirtyCount) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [edit?.dirtyCount])

  /**
   * Watch for the deployment to change over.
   *
   * Success is "the built commit is no longer the one that was there before",
   * not "it equals the sha we just made". Two saves in a row cancel the first
   * build, so only the second sha ever appears — an exact match would wait for
   * a deployment that is never coming.
   */
  useEffect(() => {
    if (!publishing) return

    let stop = false

    const poll = async () => {
      if (stop) return

      const current = await builtFrom()

      if (current !== null && current !== publishing.before) {
        setStatus(
          current === publishing.sha
            ? 'Published. Reloading…'
            : 'The site has rebuilt — your change is live. Reloading…',
        )
        setPublishing(null)
        // A full load, not router.refresh(): Vercel pins a client to the
        // deployment it arrived on, so the router would faithfully re-fetch
        // the old copy.
        window.setTimeout(() => window.location.reload(), 1200)
        return
      }

      if (Date.now() - publishing.since > PUBLISH_TIMEOUT_MS) {
        setStatus('Saved. The site is taking longer than usual to update — try refreshing shortly.')
        setPublishing(null)
        return
      }

      window.setTimeout(poll, PUBLISH_POLL_MS)
    }

    const timer = window.setTimeout(poll, PUBLISH_POLL_MS)

    return () => {
      stop = true
      window.clearTimeout(timer)
    }
  }, [publishing])

  if (!edit) return null

  const { editing, setEditing, pending: staged, dirtyCount, discard } = edit

  const onSave = () =>
    startTransition(async () => {
      setStatus('Saving…')

      // Captured before the commit, so the poll has something to compare
      // against. Null in local development, where nothing ever rebuilds.
      const before = await builtFrom()

      const result = await saveEdits(
        Object.entries(staged).map(([key, entry]) => ({ key, value: entry.value ?? '' })),
      )

      if (!result.ok) {
        // Deliberately no discard(): the edits are still on screen, which is
        // what makes "press Save again" honest advice.
        setStatus(result.error)
        return
      }

      discard()
      setEditing(false)

      if (result.count === 0) {
        setStatus('Nothing changed.')
        return
      }

      const saved = `Saved ${result.count} change${result.count === 1 ? '' : 's'}.`

      if (before === null) {
        /**
         * No build stamp to watch — local development. Say what is true rather
         * than starting a poll that can only ever time out.
         */
        setStatus(`${saved} Committed; nothing rebuilds locally.`)
        return
      }

      setStatus(`${saved} Publishing — the live site updates in about a minute.`)
      setPublishing({ sha: result.sha, before, since: Date.now() })
    })

  const onCancel = () => {
    if (dirtyCount > 0 && !window.confirm('Discard your unsaved changes?')) return
    discard()
    setEditing(false)
    setStatus(null)
    // Put the original wording back on screen.
    router.refresh()
  }

  /**
   * The way out.
   *
   * It matters most on a shared or borrowed machine, where the alternative is
   * a live homepage left editable behind them.
   */
  const onSignOut = async () => {
    if (dirtyCount > 0 && !window.confirm('Sign out and discard your unsaved changes?')) return

    setSigningOut(true)

    try {
      await fetch('/api/editor-logout', { method: 'POST' })
    } catch {
      // Reload anyway. If the session really did end the toolbar will not come
      // back; if it did not, it will — and either way that is the truth, which
      // is better than a button that reports success it cannot vouch for.
    }

    discard()
    setEditing(false)

    /**
     * Next tick, so React has cleared the unsaved-changes guard above before
     * the navigation starts. Otherwise the browser asks a second time about
     * changes this person has already agreed to discard.
     */
    // A full load, not router.push: the session cookie has just been cleared,
    // and every router entry the client is holding was fetched while it was
    // still valid. Pushing would leave the signed-in page on screen.
    window.setTimeout(() => window.location.assign('/'), 0)
  }

  return (
    <div className="edit-bar" role="region" aria-label="Page editor">
      {/* Decorative — the button beside it announces the same state. */}
      <span className={`edit-bar__dot${editing ? ' is-on' : ''}`} aria-hidden="true" />

      <button
        disabled={publishing !== null}
        className={`edit-bar__btn${editing ? ' is-on' : ''}`}
        onClick={() => (editing ? onCancel() : setEditing(true))}
        aria-pressed={editing}
      >
        {editing ? 'Editing' : 'Edit'}
      </button>

      <button
        className="edit-bar__btn"
        onClick={onSave}
        disabled={pending || dirtyCount === 0 || publishing !== null || !canPublish}
        title={canPublish ? undefined : 'Publishing is not configured on this site'}
      >
        Save{dirtyCount > 0 ? ` (${dirtyCount})` : ''}
      </button>

      <button
        className="edit-bar__btn"
        onClick={onCancel}
        disabled={pending || !editing || publishing !== null}
      >
        Cancel
      </button>

      {/* No Admin button: there is no admin panel on this site. The bar is the
          whole interface, which is the point. */}

      <button className="edit-bar__btn" onClick={onSignOut} disabled={pending || signingOut}>
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>

      {/* aria-live so the outcome reaches a screen reader, not only the eye. */}
      <p className="edit-bar__status" aria-live="polite">
        {pending
          ? 'Saving…'
          : !canPublish
            ? 'Publishing is not configured: this site has no GITHUB_TOKEN, so changes cannot be saved yet.'
            : status}
      </p>
    </div>
  )
}
