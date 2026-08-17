import 'server-only'
import { idForPath } from '@/lib/media'

/**
 * The walk that decides what is editable, and what kind of thing it is.
 *
 * This exists because "click the sentence and change it" is a different thing
 * from "find the right field in a form" — and for the person who actually
 * writes the copy, it is the difference between updating the site and asking
 * someone to.
 *
 * WHY A SCHEMA RATHER THAN A LOOK AT THE VALUES
 * A field is prose because the schema says so, never because the string looked
 * like prose. Content is full of enums that read as plain English — a layout
 * discriminator holding "board", a colour key holding "sage". Made editable,
 * the word could be typed over and written back into something the code
 * branches on. See contentSchema.ts.
 *
 * Nothing here is tied to any CMS despite the field vocabulary: `walkFields`
 * takes any object shaped like FieldLike, which is what lets a hand-written
 * schema drive it.
 */


/**
 * Field names that are never body copy — they point somewhere, key something,
 * or are wanted verbatim.
 */
const SKIP = new Set([
  'id',
  'slug',
  'status',
  'icon',
  'platform',
  'publishedAt',
  'updatedAt',
  'createdAt',
  'alt',
  'filename',
  'mimeType',
  'url',
  'email',
  'phone',
  'mobile',
  'mapEmbed',
])

const SKIP_SUFFIX = /(href|src|url|lat|lng|zoom)$/i

const looksLikeTarget = (value: string) => /^(\/|#|https?:|mailto:|tel:)/.test(value.trim())

/**
 * Too short to match safely: a two-character string collides with fragments all
 * over a page and would make the wrong thing editable.
 */
const MIN_LENGTH = 4

function eligible(key: string, value: string): boolean {
  if (SKIP.has(key) || SKIP_SUFFIX.test(key)) return false
  if (looksLikeTarget(value)) return false
  return value.trim().length >= MIN_LENGTH
}


/** Merge several collected maps into the one the browser receives. */
export function mergeEditable(...maps: Record<string, string>[]): Record<string, string> {
  return Object.assign({}, ...maps)
}

/* ---------------------------------------------------------------------------
 * Regions that are not sentences
 *
 * Text finds itself: the editor looks for the string in the page and knows the
 * field it came from. A photograph and an icon carry no such signal, so they
 * have to be declared — and the components mark themselves with the matching
 * `data-edit-key`.
 *
 * These come from the schema rather than being listed here.
 * A list would be a second place to remember, and it would already be wrong:
 * writing one by hand missed `heroPoster` (an upload that is not called an
 * image) and both of the about page's nested galleries. The schema cannot
 * drift from itself.
 * ------------------------------------------------------------------------- */

export type ImageRegion = {
  kind: 'image'
  key: string
  /** Null when the field is empty and the component is showing its fallback. */
  mediaId: number | null
  /** Filled in by the caller, which is where the media documents are read. */
  alt: string
  /** For the picker's heading — "Hero poster", not "heroPoster". */
  label: string
}

export type IconRegion = {
  kind: 'icon'
  key: string
  value: string
  options: { label: string; value: string }[]
}

export type Region = ImageRegion | IconRegion

/**
 * The shape of a schema field, narrowed to what this walk needs. A CMS's own
 * `Field` union is far wider, and matching it exactly here would mean naming
 * every variant only to ignore most of them.
 */
export type FieldLike = {
  type: string
  name?: string
  fields?: FieldLike[]
  tabs?: { name?: string; fields: FieldLike[] }[]
  relationTo?: string | string[]
  options?: unknown
}

const humanize = (name: string) =>
  name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase())

/** Accepts `['a','b']` or `[{label,value}]`. Normalise to the latter. */
function normaliseOptions(options: unknown): { label: string; value: string }[] {
  if (!Array.isArray(options)) return []
  return options.flatMap((option) => {
    if (typeof option === 'string') return [{ label: humanize(option), value: option }]
    if (option && typeof option === 'object') {
      const { label, value } = option as { label?: unknown; value?: unknown }
      if (typeof value === 'string') {
        return [{ label: typeof label === 'string' ? label : humanize(value), value }]
      }
    }
    return []
  })
}

/**
 * An upload field's value may be an id, a public path, or a populated
 * document, depending on where the content came from. Accept all three.
 */
function mediaId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  /**
   * A file-backed site stores a public path where a CMS stored a row id, so hash it
   * to the same numeric space the picker works in. Tested after the numeric
   * branch above so a stray "14" still behaves as an id rather than a path.
   *
   * Without this every ImageRegion reports `mediaId: null`, the picker
   * highlights nothing, and the failure looks like a badge that never appears
   * rather than an error.
   */
  if (typeof value === 'string' && value.startsWith('/')) return idForPath(value)
  if (value && typeof value === 'object') {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number') return id
  }
  return null
}

/**
 * Walk the schema and the data together, collecting the images and icons.
 *
 * `row`, `collapsible` and unnamed `tabs` are presentational — they group
 * fields for display and add nothing to the stored shape — so they are
 * stepped through without extending the path. Groups, named tabs and arrays do
 * add a segment, and an array adds one per row, which is what makes
 * `homepage.heroFacts.2.icon` addressable at all.
 */
/**
 * Everything editable in one document: the prose, and the pictures.
 *
 * WHY THE PROSE IS READ FROM THE SCHEMA TOO
 * It used to be found by walking the stored data and taking any string that was
 * not on a list of field names to avoid. That list cannot know a `select` from
 * a sentence, and the difference matters: `settings.mapPins.0.kind` holds
 * "office", which is six characters of prose as far as a name list is
 * concerned, and is really one of a fixed set of values. Made editable, the
 * word "office" anywhere on the page could be typed over and written back into
 * an enum. Wider content models add more of the same —
 * `unitType` is a select reading "Residential lot".
 *
 * So a field is prose when the schema says it is: `text` or `textarea`, and
 * nothing else. That also drops any bookkeeping fields (`id`,
 * timestamps) without needing to name any of it.
 */
export function collectEditable(
  prefix: string,
  fields: unknown,
  data: unknown,
): { values: Record<string, string>; regions: Region[] } {
  const values: Record<string, string> = {}
  const out: Region[] = []

  const walkFields = (list: FieldLike[] | undefined, node: unknown, path: string): void => {
    if (!Array.isArray(list)) return
    const record = (node && typeof node === 'object' ? node : {}) as Record<string, unknown>

    for (const field of list) {
      // Presentational wrappers: same data, same path.
      if (field.type === 'row' || field.type === 'collapsible') {
        walkFields(field.fields, node, path)
        continue
      }

      if (field.type === 'tabs') {
        for (const tab of field.tabs ?? []) {
          if (tab.name) walkFields(tab.fields, record[tab.name], `${path}.${tab.name}`)
          else walkFields(tab.fields, node, path)
        }
        continue
      }

      if (!field.name) continue

      if (field.type === 'group') {
        walkFields(field.fields, record[field.name], `${path}.${field.name}`)
        continue
      }

      if (field.type === 'array') {
        const rows = record[field.name]
        if (Array.isArray(rows)) {
          rows.forEach((row, index) =>
            walkFields(field.fields, row, `${path}.${field.name}.${index}`),
          )
        }
        continue
      }

      if (field.type === 'upload' && field.relationTo === 'media') {
        out.push({
          kind: 'image',
          key: `${path}.${field.name}`,
          mediaId: mediaId(record[field.name]),
          alt: '',
          label: humanize(field.name),
        })
        continue
      }

      /**
       * Only fields actually named `icon`. Every select that
       * picks a glyph is called that, and widening it to all selects would drag
       * in statuses and other choices that are not pictures of anything.
       */
      if (field.type === 'select' && field.name === 'icon') {
        const value = record[field.name]
        out.push({
          kind: 'icon',
          key: `${path}.${field.name}`,
          value: typeof value === 'string' ? value : '',
          options: normaliseOptions(field.options),
        })
        continue
      }

      /**
       * Prose. Rich text is not here on purpose: its value is a Lexical
       * document, not a string, so it could never match a text node on the page
       * nor be written back from one. It stays wherever it is authored, which has a
       * proper editor for it.
       */
      if (field.type === 'text' || field.type === 'textarea') {
        const value = record[field.name]
        if (typeof value === 'string' && eligible(field.name, value)) {
          values[`${path}.${field.name}`] = value
        }
      }
    }
  }

  walkFields(fields as FieldLike[], data, prefix)
  return { values, regions: out }
}

/**
 * Write `value` at a dotted path, creating nothing that does not already exist.
 *
 * A path that no longer matches the data — a field renamed, an array item
 * deleted between loading the page and saving — is ignored rather than
 * inventing structure for it. A stale edit should do nothing, not corrupt the
 * document it is applied to.
 */
export function setPath(target: unknown, path: string[], value: unknown): boolean {
  let node = target as Record<string, unknown>
  for (let i = 0; i < path.length - 1; i++) {
    const next = node?.[path[i]]
    if (next === null || typeof next !== 'object') return false
    node = next as Record<string, unknown>
  }
  const last = path[path.length - 1]
  if (node && typeof node === 'object' && last in node) {
    node[last] = value
    return true
  }
  return false
}
