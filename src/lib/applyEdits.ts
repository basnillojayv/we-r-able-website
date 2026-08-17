import copy from '@/content/copy.json'
import { collectEditable, setPath } from '@/lib/inlineEdit'
import { contentSchema } from '@/lib/contentSchema'
import { MEDIA_BY_ID, idForPath } from '@/lib/media'
import { isUploadablePath } from '@/lib/uploads'

export type Edit = { key: string; value: string | number }

/** `media.<numeric id>.alt`, the one key format the client invents itself. */
const MEDIA_ALT = /^media\.(\d+)\.alt$/

/**
 * Every key the schema is willing to have written, computed once.
 *
 * WHY THIS EXISTS SEPARATELY FROM THE SCHEMA
 * Leaving a field out of the schema stops it being *offered*, but not from
 * being *written*: `setPath` assigns wherever the key already exists, and
 * plenty of non-editable content does exist in copy.json — `profile.email`
 * among it. Without this gate a forged POST to the server action could change
 * the address behind every `mailto:` link on the site, having never appeared
 * in the editor at all.
 *
 * A server action is a public endpoint. The schema has to be enforced here,
 * not only consulted when deciding what to show.
 */
const allowedKeys: Set<string> = (() => {
  const collected = collectEditable('copy', contentSchema, copy)
  return new Set([...Object.keys(collected.values), ...collected.regions.map((r) => r.key)])
})()

/**
 * Is this key one the editor is allowed to write?
 *
 * `media.<id>.alt` is the exception: it is synthesised by the picker rather
 * than derived from the schema, so it is admitted on shape alone. It is not
 * checked against the known media, because a photograph uploaded moments ago
 * is not in the manifest yet — that is regenerated at build time.
 *
 * Letting it through costs nothing, because the fan-out in pass 3 *is* the
 * authorisation: it only ever writes `alt` beside a `src` the document already
 * holds. An id matching nothing on the page writes nothing.
 */
function permitted(key: string): boolean {
  if (MEDIA_ALT.test(key)) return true
  return allowedKeys.has(key)
}

function readPath(node: unknown, path: string[]): unknown {
  let current = node
  for (const segment of path) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

/**
 * Every image path the schema declares, read from the document being changed.
 *
 * Derived from the schema rather than written out, because a hardcoded shape
 * is a second place to keep in step — and it silently does nothing when the
 * next site models its images differently.
 */
function imagePaths(doc: Record<string, unknown>): string[][] {
  return collectEditable('copy', contentSchema, doc)
    .regions.filter((region) => region.kind === 'image')
    .map((region) => region.key.split('.').slice(1))
}

/**
 * Apply a batch of edits to a content document in place. Returns how many
 * actually landed.
 *
 * Pure, and separate from the server action, because a `'use server'` module
 * may only export async actions — which would leave the one piece of real
 * logic here untestable.
 *
 * `setPath` writes only where the key already exists and never invents
 * structure, so an edit whose path has since been renamed or removed
 * contributes nothing rather than corrupting the file. That is what keeps
 * `count` meaning "edits that took effect" rather than "edits submitted".
 */
export function applyEdits(doc: Record<string, unknown>, edits: Edit[]): number {
  let applied = 0

  // Anything the schema does not sanction never reaches setPath.
  edits = edits.filter((edit) => permitted(edit.key))

  // 1. Prose and icon choices — a plain write at the edit's own path.
  for (const edit of edits) {
    if (MEDIA_ALT.test(edit.key) || edit.key.endsWith('.src')) continue
    if (setPath(doc, edit.key.split('.').slice(1), String(edit.value))) applied += 1
  }

  /**
   * 2. Photograph swaps, in either of the two forms the picker produces.
   *
   * Choosing one already on the site stages its numeric media id, which is
   * translated to the path the document holds. Choosing one just uploaded
   * stages the path directly — it has no id yet, because ids come from the
   * manifest and that is rebuilt with the site.
   *
   * The path form is checked by shape rather than against known media, for the
   * same reason; see isUploadablePath, which is deliberately strict about it.
   */
  for (const edit of edits) {
    if (!edit.key.endsWith('.src')) continue

    const url =
      typeof edit.value === 'string' && edit.value.startsWith('/')
        ? isUploadablePath(edit.value)
          ? edit.value
          : undefined
        : MEDIA_BY_ID.get(Number(edit.value))?.url

    if (!url) continue // unknown id or unusable path: write nothing, count nothing
    if (setPath(doc, edit.key.split('.').slice(1), url)) applied += 1
  }

  /**
   * 3. Alt text, last and against the already-mutated document.
   *
   * The ordering is not cosmetic: when one batch both swaps a photograph and
   * rewrites its description, the description has to resolve against the *new*
   * src, or it lands on the picture that was just replaced.
   *
   * One edit fans out to every row using that file, which is exactly what the
   * picker tells the editor will happen. Counted once per edit, matching what
   * they actually typed.
   */
  const paths = imagePaths(doc)
  for (const edit of edits) {
    const match = MEDIA_ALT.exec(edit.key)
    if (!match) continue

    const id = Number(match[1])
    let landed = false

    for (const srcPath of paths) {
      const src = readPath(doc, srcPath)
      if (typeof src !== 'string' || idForPath(src) !== id) continue
      const altPath = [...srcPath.slice(0, -1), 'alt']
      if (setPath(doc, altPath, String(edit.value))) landed = true
    }

    if (landed) applied += 1
  }

  return applied
}
