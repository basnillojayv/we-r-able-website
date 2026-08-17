'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { site } from '@/site.config'
import { requestEditing } from './editSignal'

/**
 * The sign-in panel at /edit.
 *
 * This site has no CMS and no admin panel, so this is the only door. There is
 * one shared passphrase rather than accounts: exactly one person edits this
 * site, and a user table with a single row in it would be a database to
 * maintain for no one's benefit.
 *
 * No email field, therefore — asking for a username that is not checked would
 * be theatre. The password posts to /api/editor-login, which sets a signed
 * cookie; there is no token handling on this side.
 */
export function EditLogin() {
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<'checking' | 'idle' | 'signing-in'>('checking')
  const [error, setError] = useState<string | null>(null)

  const id = (name: string) => `${uid}-${name}`

  /**
   * Someone already signed in has nothing to answer here, so send them on.
   *
   * This asks `/api/editor-status` — the same endpoint the editor itself uses —
   * rather than adding a second way to ask who someone is. It also means this
   * page follows the same rule as the rest of the site: static HTML first, the
   * question about identity afterwards.
   */
  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const response = await fetch('/api/editor-status', { cache: 'no-store' })
        const data = response.ok ? await response.json() : null
        if (cancelled) return

        if (data?.canEdit) {
          requestEditing()
          // Full load, not router.push — see the note on the sign-in path below.
          window.location.assign('/')
          return
        }
      } catch {
        // Unreachable: fall through and show the form. A network that cannot
        // answer this question may still be able to carry a sign-in.
      }

      if (!cancelled) setState('idle')
    }

    check()

    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state !== 'idle') return

    const data = Object.fromEntries(new FormData(event.currentTarget).entries())

    setState('signing-in')
    setError(null)

    try {
      const response = await fetch('/api/editor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password }),
      })

      if (response.ok) {
        requestEditing()
        /**
         * A real navigation, not a client-side one. The session cookie has just
         * changed, and every router entry the client is holding was fetched
         * without it — pushing would show them pages rendered for a stranger.
         *
         * Deliberately still in the 'signing-in' state: the button stays
         * disabled until the page is replaced.
         */
        window.location.assign('/')
        return
      }

      setState('idle')

      /**
       * The server's message, which distinguishes a wrong password from
       * editing not being configured at all — the second is a deployment
       * problem, and someone typing a correct passphrase into a site that
       * cannot check it deserves better than "not recognised".
       */
      const body = await response.json().catch(() => null)
      setError(body?.errors?.[0]?.message || 'That password was not recognised.')
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id('password'))}`)?.focus()
    } catch {
      setState('idle')
      setError('Could not reach the server. Check your connection and try again.')
    }
  }

  /**
   * Nothing but a holding line until the question above is answered. Showing
   * the form first would flash a password prompt at someone who is already
   * signed in and about to be sent to the homepage.
   */
  if (state === 'checking') {
    return (
      <p className="edit-login__wait" role="status">
        One moment…
      </p>
    )
  }

  return (
    <div className="edit-login">
      <p className="edit-login__eyebrow">{site.name}</p>
      <h1 className="edit-login__title">Sign in to edit</h1>
      {/* Says "about a minute" because that is true: saving commits the change
          and the site rebuilds. Promising "straight away" here would be the
          first thing the editor was caught lying about. */}
      <p className="edit-login__lede">
        The homepage opens ready to edit. Click any heading or paragraph, type over it, and save —
        your change publishes itself and reaches the live site about a minute later.
      </p>

      <form className="form" ref={formRef} onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor={id('password')}>Password</label>
          <input
            id={id('password')}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? id('error') : undefined}
          />
        </div>

        {error && (
          <p className="form__error" id={id('error')} role="alert">
            {error}
          </p>
        )}

        <button
          className="btn btn--accent btn--lg btn--block"
          type="submit"
          disabled={state === 'signing-in'}
        >
          {state === 'signing-in' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="form__note">
        Words and photographs on the page can be changed here. New photographs,
        video and anything that changes the layout are part of the site itself —
        ask your developer for those.
      </p>
    </div>
  )
}
