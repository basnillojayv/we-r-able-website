/**
 * The one-shot handshake between /edit and the page it lands on.
 *
 * Signing in at /edit is an unambiguous statement of intent, so the homepage it
 * hands you should already be editable — but the homepage is `force-static` and
 * cannot be told anything by the server. This carries the request across the
 * navigation instead.
 *
 * sessionStorage rather than `?edit=1`: a query string could not change the
 * static HTML either, so it would be read on the client exactly like this — but
 * it would leave a URL that looks shareable while granting nothing. This dies
 * with the tab, which is the honest lifetime for "I just signed in".
 *
 * Both calls tolerate storage being unavailable. Safari's private mode and a
 * locked-down browser profile both throw on access, and losing the convenience
 * of arriving in edit mode must never cost someone the sign-in itself.
 */
const KEY = 'epd:enter-editing'

/** Ask the next page load to arrive with edit mode already on. */
export function requestEditing(): void {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // No storage: they arrive signed in, with edit mode off. One click away.
  }
}

/**
 * Read the request and consume it in the same breath.
 *
 * Clearing on read is the whole point. Left in place, a refresh an hour later
 * would silently drop someone back into edit mode they never asked for — and
 * the thing that stops careless typing on a live page is that edit mode is
 * always something you chose.
 */
export function takeEditingRequest(): boolean {
  try {
    const asked = sessionStorage.getItem(KEY) === '1'
    if (asked) sessionStorage.removeItem(KEY)
    return asked
  } catch {
    return false
  }
}
