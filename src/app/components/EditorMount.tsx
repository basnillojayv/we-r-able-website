'use client'

import { useEffect, useState } from 'react'
import { EditProvider, type MediaItem, type Region } from './EditProvider'
import { EditSurface } from './EditSurface'
import { EditPicker } from './EditPicker'
import { EditBar } from './EditBar'
import { takeEditingRequest } from './editSignal'

/**
 * Brings up the in-place editor for staff, without costing visitors anything.
 *
 * Every page here is `force-static` — which is why the site is fast — and a
 * static route cannot read cookies, so the server has no way to tell who is
 * asking. Making the layout dynamic would fix that by making every visitor
 * request hit the database, for a feature only staff can use.
 *
 * So the page renders static and this asks the one question afterwards. A
 * visitor gets a few bytes back and nothing happens; the editor code below is
 * never rendered for them.
 *
 * The request waits for the browser to be idle, so it can never compete with
 * the page finishing painting.
 */
type Content = {
  values: Record<string, string>
  regions: Region[]
  media: MediaItem[]
}

/**
 * The arrival flag, consumed once per page load.
 *
 * `/edit` sets it immediately before navigating here, and reading it clears
 * it — so it can only be taken once. React runs effects twice in development,
 * and the second pass would find it already spent and conclude "arrived
 * normally", which is how the editor ends up closed for someone who just
 * signed in. Latching it at module scope keeps the answer stable for the whole
 * page load, which is the lifetime it actually describes.
 */
let arrival: boolean | null = null

function arrivedFromSignIn(): boolean {
  if (arrival === null) arrival = takeEditingRequest()
  return arrival
}

export function EditorMount() {
  /**
   * The arrival flag travels with the content rather than in its own state.
   *
   * It is consumed synchronously below but only ever read once the fetch has
   * resolved, so there is exactly one state update here — which is also what
   * keeps this clear of `set-state-in-effect` (a synchronous setState in an
   * effect body) and of reading a ref during render. Both rules are pointing
   * at the same thing: this was never independently render-affecting state.
   */
  const [session, setSession] = useState<{ content: Content; arriveEditing: boolean } | null>(null)

  useEffect(() => {
    let cancelled = false

    // Synchronously, before anything can await, and latched — see above.
    const arriveEditing = arrivedFromSignIn()

    const ask = async () => {
      try {
        const response = await fetch('/api/editor-status', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        if (!cancelled && data?.canEdit) {
          setSession({
            content: {
              values: data.values ?? {},
              regions: data.regions ?? [],
              media: data.media ?? [],
            },
            arriveEditing,
          })
        }
      } catch {
        // Offline, or the endpoint is unreachable. No editor, no error on the
        // page — a visitor must never see a failure from a feature that is not
        // theirs.
      }
    }

    const idle = window.requestIdleCallback?.(ask, { timeout: 2000 }) ?? window.setTimeout(ask, 400)

    return () => {
      cancelled = true
      window.cancelIdleCallback?.(idle as number)
      window.clearTimeout(idle as number)
    }
  }, [])

  if (!session) return null

  return (
    <EditProvider
      values={session.content.values}
      regions={session.content.regions}
      media={session.content.media}
      initialEditing={session.arriveEditing}
    >
      <EditSurface />
      <EditPicker />
      <EditBar />
    </EditProvider>
  )
}
