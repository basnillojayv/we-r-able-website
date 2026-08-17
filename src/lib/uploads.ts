/**
 * Where uploaded photographs land, and what counts as one.
 *
 * Shared by the upload route (which writes the file) and the save path (which
 * accepts the resulting path as a value), so the two cannot disagree about
 * what is allowed. No `server-only` here: it is a constant and a regex, and
 * being importable from either side is the point.
 */

/**
 * Under `public/`. The media manifest lists this folder, so anything added
 * here joins the picker from the next build onwards.
 */
export const UPLOAD_DIR = 'assets/img'

const UPLOADED = new RegExp(`^/${UPLOAD_DIR}/[a-z0-9][a-z0-9-]*\\.(webp|png|jpg|jpeg|avif)$`)

/**
 * Is this a path the editor may write into the content file?
 *
 * A freshly uploaded photograph is not in the media manifest yet — that is
 * regenerated at build time — so the save path cannot check it against known
 * ids the way it checks an existing choice. This is the substitute: a strict
 * shape, one known folder, a known extension, no traversal.
 *
 * Deliberately narrow. The value ends up as an `<img src>`, so the worst a
 * malformed one could do is show a broken image — but "the worst case is mild"
 * is not a reason to accept arbitrary strings from a public endpoint.
 */
export function isUploadablePath(value: string): boolean {
  if (value.includes('..') || value.includes('//')) return false
  return UPLOADED.test(value)
}
