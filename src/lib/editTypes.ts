/**
 * The one shape the browser and the server both need to agree on.
 *
 * It lives in its own module with no imports for two reasons. `applyEdits`
 * pulls in `inlineEdit`, which is `server-only`, so a client component cannot
 * take the type from there. And a `'use server'` module may only export async
 * functions — re-exporting a type from one is erased by TypeScript but *not*
 * by Next's server-action transform on every version, which emits a reference
 * to a value that no longer exists and throws `Edit is not defined` the moment
 * Save is pressed.
 */
export type Edit = { key: string; value: string | number }
