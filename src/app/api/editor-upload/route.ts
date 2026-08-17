import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { getEditor } from '@/lib/editorAuth'
import { UPLOAD_DIR, isUploadablePath } from '@/lib/uploads'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// INSTALL: set EDITOR_REPO to "owner/name".
const REPO = process.env.EDITOR_REPO ?? ''
const BRANCH = process.env.EDITOR_BRANCH ?? 'main'

/**
 * 8MB before encoding. Large enough for any photograph a phone produces,
 * small enough that a mistake does not put a video in the repository — every
 * byte here is permanent history, cloned by everyone, forever.
 */
const MAX_BYTES = 8 * 1024 * 1024

/** Extension by magic number, not by the name the browser supplied. */
function sniff(bytes: Buffer): string | null {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString('ascii')

  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp'
  if (bytes[0] === 0x89 && ascii(1, 4) === 'PNG') return 'png'
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (ascii(4, 8) === 'ftyp' && ascii(8, 12).startsWith('avif')) return 'avif'
  return null
}

/** "My Photo (2).JPG" -> "my-photo-2" */
function slugify(name: string): string {
  return (
    name
      .replace(/\.[a-z0-9]+$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'photo'
  )
}

const fail = (status: number, message: string) =>
  NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })

/**
 * Add a photograph to the site.
 *
 * The file is committed into `public/` — there is no object store here, and
 * introducing one would put the images somewhere the repository does not
 * describe. A photograph becomes part of the site in the same way its words do.
 *
 * This commits on its own rather than waiting for Save, because the editor
 * needs a real URL to point at before the change can be staged. The result is
 * two commits for an upload-then-save, and two builds. That is the honest cost
 * of having no bucket, and uploads are rare.
 */
export async function POST(request: Request) {
  const { canEdit } = await getEditor()
  if (!canEdit) return fail(403, 'Not allowed.')

  if (!process.env.GITHUB_TOKEN || !REPO) {
    return fail(503, 'Publishing is not set up on this site yet.')
  }

  let name: unknown
  let data: unknown
  try {
    const body = await request.json()
    name = body?.name
    data = body?.data
  } catch {
    return fail(400, 'That upload could not be read.')
  }

  if (typeof data !== 'string' || typeof name !== 'string') {
    return fail(400, 'That upload could not be read.')
  }

  let bytes: Buffer
  try {
    bytes = Buffer.from(data, 'base64')
  } catch {
    return fail(400, 'That upload could not be read.')
  }

  if (bytes.length === 0) return fail(400, 'That file is empty.')
  if (bytes.length > MAX_BYTES) {
    return fail(413, `That image is larger than ${MAX_BYTES / 1024 / 1024}MB. Please resize it first.`)
  }

  const extension = sniff(bytes)
  if (!extension) {
    return fail(415, 'That is not an image the site can use. Try a JPEG, PNG, WebP or AVIF.')
  }

  /**
   * The content hash in the filename does two jobs: it makes a name collision
   * impossible without a round-trip to check, and it makes re-uploading the
   * same photograph idempotent rather than a second copy under a second name.
   */
  const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 8)
  const path = `public/${UPLOAD_DIR}/${slugify(name)}-${digest}.${extension}`
  const url = path.replace(/^public/, '')

  if (!isUploadablePath(url)) {
    return fail(400, 'That filename could not be used.')
  }

  const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'inline-editor-git',
    },
    body: JSON.stringify({
      message: `Add photograph ${url} from the in-place editor`,
      content: bytes.toString('base64'),
      branch: BRANCH,
    }),
  })

  /**
   * 422 here means a file already exists at this path — which, since the path
   * carries the content hash, means this exact photograph is already on the
   * site. Report it as success: the caller wanted a URL for these bytes, and
   * that URL is correct.
   */
  if (response.status === 422) {
    return NextResponse.json({ url, existed: true }, { headers: { 'Cache-Control': 'no-store' } })
  }

  if (response.status === 401 || response.status === 403) {
    return fail(502, 'The publishing key was rejected. It may have expired.')
  }

  if (!response.ok) {
    return fail(502, 'GitHub could not be reached. The photograph was not added.')
  }

  return NextResponse.json({ url, existed: false }, { headers: { 'Cache-Control': 'no-store' } })
}
