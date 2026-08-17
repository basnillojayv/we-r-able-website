import { NextResponse } from 'next/server'
import copy from '@/content/copy.json'
import { getEditor } from '@/lib/editorAuth'
import { contentSchema } from '@/lib/contentSchema'
import { collectEditable, mergeEditable, type Region } from '@/lib/inlineEdit'
import { MEDIA, humanizeFilename } from '@/lib/media'

export const runtime = 'nodejs'
/**
 * Must be dynamic: the whole job is reading the session cookie, and a cached
 * answer would either hand the editor to everyone or to no one.
 */
export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/**
 * Alt text per photograph — of which this site has none.
 *
 * The picker offers a Description field when a photograph carries alt text in
 * the content. Here the only images are video thumbnails, rendered `alt=""`
 * and `aria-hidden` because the visible heading beside them already names the
 * video. There is nothing to describe and nothing to write, so this is empty
 * and the field does not appear.
 */
function altByMediaId(): Map<number, string> {
  return new Map()
}

/**
 * A heading for the picker panel.
 *
 * The walk labels a region from its field name, which for a field called
 * `thumb` produces "Thumb" — true, and useless to the person looking at it.
 * The key knows which video the thumbnail belongs to, so use that.
 */
function labelForImage(key: string): string {
  const match = /^copy\.videos\.(\d+)\.thumb$/.exec(key)
  if (!match) return 'Photograph'

  const video = copy.videos[Number(match[1])]
  return video ? `${video.title} — thumbnail` : 'Photograph'
}

/**
 * Two content paths holding the same string cannot both be edited: the surface
 * matches on text content and gives each node one path in document order, so
 * the second occurrence binds to whichever path came first.
 *
 * The known cases are handled by keeping nav labels and hero card titles out of
 * the content module and marking their nodes `data-edit-skip`. This warns if a
 * new one appears — cheap, and the alternative is discovering it as "that
 * heading stopped being clickable".
 */
function warnOnDuplicateValues(values: Record<string, string>): void {
  if (process.env.NODE_ENV === 'production') return

  const seen = new Map<string, string>()
  for (const [path, value] of Object.entries(values)) {
    const text = value.trim()
    const first = seen.get(text)
    if (first) {
      console.warn(
        `[editor] "${text.slice(0, 48)}" is held by both ${first} and ${path} — ` +
          `only the first text node on the page will bind.`,
      )
      continue
    }
    seen.set(text, path)
  }
}

/**
 * Tells the browser whether this person may edit, and if so, what.
 *
 * WHY THIS ENDPOINT EXISTS
 * `/` is statically prerendered, which is why it is fast and cheap to serve —
 * and a static route cannot read cookies, so the layout has no way to know who
 * is asking. Dropping that would make every visitor request do work for a
 * feature only one person uses.
 *
 * So the page stays static and the editor arrives afterwards: the browser asks
 * this one question, and only a signed-in editor gets an answer with anything
 * in it. For a visitor it is a few bytes and no work at all.
 */
export async function GET() {
  const { canEdit } = await getEditor()

  // Nothing to say. Told not to cache, because the answer is per-person.
  if (!canEdit) {
    return NextResponse.json({ canEdit: false }, { headers: noStore })
  }

  try {
    const collected = collectEditable('copy', contentSchema, copy)
    const values = mergeEditable(collected.values)
    warnOnDuplicateValues(values)

    const alts = altByMediaId()

    /**
     * Regions arrive with `alt: ''` because the walk has no media table to read
     * from. Fill it here, which is where that knowledge lives.
     */
    const regions: Region[] = collected.regions.map((region) =>
      region.kind === 'image'
        ? {
            ...region,
            alt: region.mediaId === null ? '' : (alts.get(region.mediaId) ?? ''),
            label: labelForImage(region.key),
          }
        : region,
    )

    /**
     * Photographs only. Icons reach the picker through the schema's `select`
     * options instead, and the tool logos are not offered at all — each carries
     * a hand-tuned display size, so swapping one breaks the row it sits in.
     */
    const media = MEDIA.filter((item) => item.kind === 'photo').map((item) => ({
      id: item.id,
      alt: alts.get(item.id) ?? humanizeFilename(item.filename),
      url: item.url,
      filename: item.filename,
    }))

    return NextResponse.json({ canEdit: true, values, regions, media }, { headers: noStore })
  } catch (error) {
    /**
     * A malformed copy.json from a bad merge should cost the edit bar, not
     * throw a 500 into the mount's fetch and leave a broken page behind it.
     */
    console.error('[editor] could not build the editable set', error)
    return NextResponse.json({ canEdit: false }, { headers: noStore })
  }
}
