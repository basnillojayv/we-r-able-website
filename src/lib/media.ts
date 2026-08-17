import manifest from '@/content/media.manifest.json'

export type MediaEntry = {
  id: number
  kind: 'photo' | 'icon'
  url: string
  filename: string
}

/**
 * A stable numeric id for a public path.
 *
 * WHY NUMERIC, AND WHY A HASH
 * `EditPicker` coerces the chosen value with `Number(id)` and synthesises alt
 * keys as `media.<id>.alt`, which the save path matches with `/^media\.(\d+)/`.
 * Numeric ids therefore keep the whole client half unmodified — the alternative
 * was five edits across the files this port is trying not to touch.
 *
 * A hash of the path rather than an index into the list: an index shifts the
 * moment a file is added to `public/`, so an edit staged before a deploy and
 * saved after one would land on a different photograph. FNV-1a, masked to 31
 * bits so it is always a positive safe integer.
 */
export function idForPath(url: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < url.length; i += 1) {
    hash ^= url.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 1) || 1
}

const entry = (url: string, kind: MediaEntry['kind']): MediaEntry => ({
  id: idForPath(url),
  kind,
  url,
  filename: url.slice(url.lastIndexOf('/') + 1),
})

export const MEDIA: MediaEntry[] = [
  ...manifest.photos.map((url) => entry(url, 'photo')),
  ...manifest.icons.map((url) => entry(url, 'icon')),
]

/**
 * Two paths hashing alike would silently alias two photographs — one would be
 * unreachable in the picker and the other would receive its edits. At this
 * scale it will not happen; refuse to run rather than carry the assumption
 * quietly.
 */
const byId = new Map<number, MediaEntry>()
for (const item of MEDIA) {
  const clash = byId.get(item.id)
  if (clash) {
    throw new Error(`media id collision: ${clash.url} and ${item.url} both hash to ${item.id}`)
  }
  byId.set(item.id, item)
}

export const MEDIA_BY_ID = byId

export const MEDIA_BY_URL = new Map(MEDIA.map((item) => [item.url, item]))

/** Reads as a word, not a name: "AI", not "Ai". */
const ACRONYMS: Record<string, string> = { ai: 'AI', seo: 'SEO', sop: 'SOP' }

/** "ad-01.webp" -> "Ad 01". Only ever a fallback label, never written back. */
export function humanizeFilename(filename: string): string {
  const stem = filename.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ')
  const known = ACRONYMS[stem.toLowerCase()]
  if (known) return known
  return stem.charAt(0).toUpperCase() + stem.slice(1)
}
