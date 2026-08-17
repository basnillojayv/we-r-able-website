import type { FieldLike } from '@/lib/inlineEdit'
import { iconNames } from '@/components/Icon'

/**
 * What may be edited on the page, and how.
 *
 * A field absent from here is not merely undeclared — it is **unwritable**.
 * `setPath` assigns only where a key already exists, and the save path
 * enforces this list besides, so a forged request cannot reach anything left
 * out.
 *
 * Two kinds of omission appear below, and they are not the same:
 *
 *   "not prose"  — a class name, an id, an address. Editing it breaks something.
 *   "would bind wrongly" — the string is held by two content paths, or its
 *                 first text node in the document is not the one anyone means.
 *
 * The second kind is the one that bites. Matching is by text content, in
 * document order, one node per path — so two paths holding the same words
 * cannot both work, and the earlier node wins whether or not it is the
 * sensible one. Each such case is named where it occurs.
 */

/** Real glyph names, so a chosen icon always exists in the map. */
const ICON_OPTIONS = iconNames.map((name) => ({
  label: name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()),
  value: name,
}))

/** A list rendered one row per entry; rows are objects because the walk needs
 *  a field name to address. See the note in content/site.ts. */
const proseList = (name: string, type: 'text' | 'textarea' = 'text'): FieldLike => ({
  type: 'array',
  name,
  fields: [{ type, name: 'text' }],
})

export const contentSchema: FieldLike[] = [
  {
    type: 'group',
    name: 'site',
    fields: [
      { type: 'text', name: 'tagline' },
      /**
       * Omitted:
       * - `name` — "WE R ABLE" is also `videos[2].credit`, so two paths would
       *   hold the identical string; and it is the business name, reused in
       *   metadata, JSON-LD and alt text.
       * - `phoneDisplay` — paired with `phone.href`. Editing the display
       *   without the dial string is exactly the mismatch that leaves a link
       *   calling the old number.
       * - `email` — dropped by `eligible()` anyway, and it is a mailto target.
       * - `address` — structured data feeding the JSON-LD LocalBusiness
       *   record. A typo there is not a typo, it is a wrong address.
       */
    ],
  },

  {
    type: 'group',
    name: 'sections',
    fields: [
      // `trust` omitted: its title is rendered .sr-only, so editing it would
      // change something the editor cannot see.
      { type: 'group', name: 'about', fields: [{ type: 'text', name: 'title' }, { type: 'textarea', name: 'intro' }] },
      { type: 'group', name: 'values', fields: [{ type: 'text', name: 'title' }] },
      { type: 'group', name: 'services', fields: [{ type: 'text', name: 'title' }, { type: 'textarea', name: 'intro' }] },
      {
        type: 'group',
        name: 'how',
        fields: [
          { type: 'text', name: 'title' },
          { type: 'text', name: 'titleAccent' },
          { type: 'textarea', name: 'intro' },
        ],
      },
      { type: 'group', name: 'videos', fields: [{ type: 'text', name: 'title' }, { type: 'textarea', name: 'intro' }] },
      { type: 'group', name: 'areas', fields: [{ type: 'text', name: 'title' }, { type: 'textarea', name: 'intro' }] },
      { type: 'group', name: 'cta', fields: [{ type: 'text', name: 'title' }, { type: 'textarea', name: 'intro' }] },
      { type: 'group', name: 'contact', fields: [{ type: 'text', name: 'title' }, { type: 'textarea', name: 'intro' }] },
      { type: 'group', name: 'facebook', fields: [{ type: 'text', name: 'title' }, { type: 'textarea', name: 'intro' }] },
    ],
  },

  {
    type: 'group',
    name: 'hero',
    fields: [
      { type: 'text', name: 'eyebrow' },
      // Three fields because the markup breaks the <h1> across a <br> and a
      // coloured span. Each fragment is its own text node.
      { type: 'text', name: 'titleLine1' },
      { type: 'text', name: 'titleLine2' },
      { type: 'text', name: 'titleAccent' },
      { type: 'textarea', name: 'lede' },
      /**
       * `ctaPrimary` omitted: it reads "Get in Touch", which is also
       * `sections.contact.title`. The hero comes first in the document, so
       * offering both would let the button take the heading's binding and the
       * heading would quietly stop responding. The button also carries
       * data-edit-skip, because excluding the path is not enough on its own.
       */
      { type: 'text', name: 'ctaSecondary' },
      { type: 'text', name: 'badgeTitle' },
      proseList('badgeWords'),
    ],
  },

  {
    type: 'array',
    name: 'trust',
    fields: [
      { type: 'select', name: 'icon', options: ICON_OPTIONS },
      { type: 'text', name: 'title' },
      { type: 'textarea', name: 'body' },
    ],
  },

  {
    type: 'array',
    name: 'able',
    // `letter` is not here: one character, inside an aria-hidden span, and a
    // React key. `eligible()` would drop it regardless.
    fields: [
      { type: 'text', name: 'word' },
      { type: 'textarea', name: 'body' },
    ],
  },

  {
    type: 'array',
    name: 'pillars',
    fields: [
      { type: 'select', name: 'icon', options: ICON_OPTIONS },
      { type: 'text', name: 'label' },
      { type: 'textarea', name: 'statement' },
    ],
  },

  {
    type: 'array',
    name: 'services',
    fields: [
      { type: 'select', name: 'icon', options: ICON_OPTIONS },
      { type: 'text', name: 'title' },
      { type: 'textarea', name: 'body' },
    ],
  },

  {
    type: 'array',
    name: 'steps',
    fields: [
      { type: 'text', name: 'title' },
      { type: 'textarea', name: 'body' },
    ],
  },

  {
    type: 'array',
    name: 'regions',
    fields: [
      { type: 'text', name: 'name' },
      { type: 'textarea', name: 'body' },
    ],
  },

  {
    type: 'array',
    name: 'videos',
    fields: [
      { type: 'text', name: 'title' },
      { type: 'textarea', name: 'body' },
      { type: 'text', name: 'credit' },
      // `source` omitted: two of the three read "YouTube", so two paths would
      // hold the same string. It is a platform name, not copy.
      { type: 'upload', name: 'thumb', relationTo: 'media' },
    ],
  },

  /**
   * `enquiryTopics` is deliberately absent. The strings render as <option>
   * text, and a contentEditable span inside an <option> breaks the select —
   * so they stay in copy.json, edited by hand.
   */
]
