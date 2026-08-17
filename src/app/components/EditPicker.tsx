'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEdit, type Region } from './EditProvider'
import { idForPath } from '@/lib/media'
// The site's own icon component, not the bundle's shim: these are inline
// SVGs from a compile-time map, so the picker shows the real thing rather
// than an approximation of it.
import { Icon, type IconName } from '@/components/Icon'

/**
 * Choosing, for the things that are not sentences.
 *
 * Text is edited where it sits, because typing over a heading is the whole
 * point. A photograph and an icon are picked from a set instead, so they get a
 * panel rather than a caret.
 *
 * HOW THEY ARE FOUND
 * Not by looking. A heading can be found because its text is its identity, and
 * one picture element looks like every other one. So the components say which
 * field they are rendering, with `data-edit-key`, and this matches on that.
 *
 * WHY A BADGE AND NOT JUST A CLICK
 * Clicking the photograph was the obvious design and it does not work. The
 * ghosted images sit at `z-index:-2` (globals.css: `.why__bg`, `.footer__bg`,
 * `.divider__bg`), which paints them behind their own section — so a click
 * lands on the content above and never reaches the image at all. No amount of
 * handler on the element can catch an event that is not delivered to it.
 *
 * So each region gets a badge in a layer above the page, positioned over it.
 * That works the same whether the region is a picture element, a video, or a
 * CSS background painted behind everything, which is three cases the direct
 * click handled badly or not at all.
 */
export function EditPicker() {
  const edit = useEdit()
  const editing = Boolean(edit?.editing)
  const regions = edit?.regions
  const serverMedia = edit?.media ?? []

  const [open, setOpen] = useState<Region | null>(null)
  const [spots, setSpots] = useState<{ region: Region; top: number; left: number }[]>([])

  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  /**
   * Photographs added during this session.
   *
   * They cannot come from the server payload: the picker's list is built from
   * the media manifest, which is regenerated when the site rebuilds. Until
   * that happens the file exists in the repository but nothing here knows its
   * name, so it is held locally and shown alongside the rest.
   */
  const [added, setAdded] = useState<
    {
      id: number
      alt: string
      url: string
      filename: string
      /** A blob URL. The real one 404s until the site rebuilds. */
      preview: string
      isNew: true
    }[]
  >([])

  /**
   * Mark every region that is on this page, and keep a badge over each one.
   *
   * The registry covers three globals and the visitor is looking at one page of
   * them, so most keys will not be found here. That is expected, not an error.
   */
  useEffect(() => {
    if (!editing || !regions?.length) return

    const marked: {
      region: Region
      el: HTMLElement
      handler: (event: MouseEvent) => void
      src: string | null
    }[] = []

    for (const region of regions) {
      const el = document.querySelector<HTMLElement>(`[data-edit-key="${region.key}"]`)
      if (!el) continue

      el.classList.add('is-editable-region')

      // Still worth having for the regions that *are* hit-testable — an icon
      // responds to being clicked, which is what anyone will try first.
      const handler = (event: MouseEvent) => {
        // An icon is often inside a card that is a link. Same problem the text
        // path has, same answer.
        event.preventDefault()
        event.stopPropagation()
        setOpen(region)
      }
      el.addEventListener('click', handler, true)

      marked.push({
        region,
        el,
        handler,
        src: el instanceof HTMLImageElement ? el.src : el.style.getPropertyValue('--img') || null,
      })
    }

    /** Badge positions, in viewport coordinates because the layer is fixed. */
    const measure = () => {
      setSpots(
        marked
          .map(({ region, el }) => {
            const rect = el.getBoundingClientRect()
            return { region, rect }
          })
          // Off-screen regions get no badge — 13 of them scattered down a long
          // page would otherwise pile up at the edges.
          .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0)
          .map(({ region, rect }) => ({
            region,
            top: Math.max(8, rect.top + 8),
            left: Math.max(8, rect.left + 8),
          })),
      )
    }

    measure()

    let frame = 0
    const remeasure = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measure)
    }
    window.addEventListener('scroll', remeasure, { passive: true })
    window.addEventListener('resize', remeasure)

    /**
     * Put the page back. A staged photograph is shown immediately — otherwise
     * choosing one would appear to do nothing until after Save — and that
     * preview is a lie told to the DOM, so it is taken back when edit mode
     * ends, whether that was Cancel or a successful Save.
     */
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', remeasure)
      window.removeEventListener('resize', remeasure)

      for (const { el, handler, src } of marked) {
        el.classList.remove('is-editable-region')
        el.removeEventListener('click', handler, true)
        if (src === null) continue
        if (el instanceof HTMLImageElement) el.src = src
        else el.style.setProperty('--img', src)
      }

      setSpots([])
      setOpen(null)
    }
  }, [editing, regions])

  const close = useCallback(() => setOpen(null), [])

  if (!edit || !editing) return null

  const badges = (
    <div className="edit-spots">
      {spots.map(({ region, top, left }) => (
        <button
          key={region.key}
          className="edit-spot"
          style={{ top, left }}
          onClick={() => setOpen(region)}
        >
          {region.kind === 'image' ? 'Change photo' : 'Change icon'}
        </button>
      ))}
    </div>
  )

  if (!open) return badges

  /** What is currently chosen: the staged value if there is one, else what is saved. */
  const stagedValue = edit.pending[open.key]?.value

  /**
   * Everything offerable: this session's uploads first, then the site's own.
   * `preview` is what separates the two — a blob URL exists only for a file
   * whose real path is committed but not yet deployed.
   */
  type Choice = { id: number | string; alt: string; url: string; filename: string; preview?: string }
  const media: Choice[] = [...added, ...serverMedia]

  /**
   * A photograph already on the site is staged as its numeric media id. One
   * uploaded a moment ago has no id yet — ids come from the manifest, which is
   * rebuilt with the site — so its path is staged directly, and the save path
   * accepts that form for exactly this reason.
   */
  const chooseImage = (item: { id: number | string; url: string; preview?: string }) => {
    edit.stage({ key: open.key, value: item.preview ? item.url : Number(item.id) })

    // Show it at once, in whichever way this particular image is rendered.
    // The blob preview for an upload, since the real path is not deployed yet.
    const shown = item.preview ?? item.url
    const el = document.querySelector<HTMLElement>(`[data-edit-key="${open.key}"]`)
    if (el instanceof HTMLImageElement) el.src = shown
    else el?.style.setProperty('--img', `url('${shown}')`)
  }

  const onUpload = async (file: File) => {
    setUploadError(null)
    setUploading(true)

    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      // In chunks: spreading a few million bytes into fromCharCode at once
      // overflows the argument limit and throws on exactly the large photograph
      // someone is most likely to pick.
      let binary = ''
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
      }

      const response = await fetch('/api/editor-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, data: btoa(binary) }),
      })

      const body = await response.json().catch(() => null)
      if (!response.ok || typeof body?.url !== 'string') {
        setUploadError(body?.error ?? 'That photograph could not be added.')
        return
      }

      const entry = {
        id: idForPath(body.url),
        alt: '',
        url: body.url,
        filename: body.url.slice(body.url.lastIndexOf('/') + 1),
        preview: URL.createObjectURL(file),
        isNew: true as const,
      }

      // Re-uploading the same file gives the same path, since the name carries
      // a content hash — so replace rather than accumulate duplicates.
      setAdded((list) => [entry, ...list.filter((item) => item.url !== entry.url)])
      chooseImage(entry)
    } catch {
      setUploadError('That photograph could not be added.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const currentMediaId =
    open.kind === 'image'
      ? stagedValue === undefined
        ? open.mediaId
        : typeof stagedValue === 'string' && stagedValue.startsWith('/')
          ? idForPath(stagedValue)
          : Number(stagedValue)
      : null

  const selected = media.find((item) => Number(item.id) === currentMediaId)
  const altKey = currentMediaId === null ? null : `media.${currentMediaId}.alt`
  const altValue =
    altKey && edit.pending[altKey] !== undefined
      ? String(edit.pending[altKey].value)
      : (selected?.alt ?? '')

  return (
    <>
      {badges}

      <div className="edit-pick" role="dialog" aria-modal="true" aria-label="Choose">
        <div className="edit-pick__scrim" onClick={close} />

        <div className="edit-pick__panel">
          <div className="edit-pick__head">
            <h2 className="edit-pick__title">{open.kind === 'image' ? open.label : 'Icon'}</h2>
            <button className="edit-pick__close" onClick={close} aria-label="Close">
              ✕
            </button>
          </div>

          {open.kind === 'icon' ? (
            <ul className="edit-pick__icons">
              {open.options.map((option) => {
                const active =
                  (stagedValue !== undefined ? stagedValue : open.value) === option.value
                return (
                  <li key={option.value}>
                    <button
                      className={`edit-pick__icon${active ? ' is-on' : ''}`}
                      onClick={() => edit.stage({ key: open.key, value: option.value })}
                      aria-pressed={active}
                    >
                      {/* The real component, so the choice looks like the result. */}
                      {/* Options come from the same map IconName is keyed on;
                          the schema is what guarantees that. */}
                      <Icon name={option.value as IconName} />
                      <span>{option.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <>
              {media.length === 0 && (
                <p className="edit-pick__note">
                  No photographs are available to choose from.
                </p>
              )}

              {/**
                * Uploading commits the file to the site's own repository —
                * there is no separate store for images here. It lands as its
                * own commit, before Save, because the editor needs a real URL
                * to point at before the choice can be staged.
                */}
              <div className="edit-pick__upload">
                <input
                  ref={fileRef}
                  id="edit-pick-upload"
                  type="file"
                  accept="image/webp,image/png,image/jpeg,image/avif"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void onUpload(file)
                  }}
                />
                <label className="btn btn--pill" htmlFor="edit-pick-upload">
                  {uploading ? 'Adding…' : 'Add a photograph'}
                </label>

                {uploadError ? (
                  <p className="edit-pick__note edit-pick__note--error" role="alert">
                    {uploadError}
                  </p>
                ) : (
                  <p className="edit-pick__note">
                    JPEG, PNG, WebP or AVIF, up to 8MB. It is added to the site straight away and
                    stays available for anything else on the page.
                  </p>
                )}
              </div>

              <ul className="edit-pick__grid">
                {media.map((item) => {
                  const active = Number(item.id) === currentMediaId
                  return (
                    <li key={item.id}>
                      <button
                        className={`edit-pick__shot${active ? ' is-on' : ''}`}
                        onClick={() => chooseImage(item)}
                        aria-pressed={active}
                      >
                        {/* Deliberately a plain picture element: these are 480px
                            thumbnails already, and routing them through the
                            optimizer to show them at 100px is work for nothing. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.preview ?? item.url} alt={item.alt} loading="lazy" />
                      </button>
                    </li>
                  )
                })}
              </ul>

              {altKey && (
                <div className="edit-pick__alt">
                  <label htmlFor="edit-pick-alt">Description</label>
                  <input
                    id="edit-pick-alt"
                    type="text"
                    value={altValue}
                    onChange={(event) => edit.stage({ key: altKey, value: event.target.value })}
                  />
                  <p className="edit-pick__note">
                    Read aloud by screen readers, and used by search engines. It belongs to the
                    photograph itself — changing it changes the description everywhere this
                    photograph is used.
                  </p>
                </div>
              )}

            </>
          )}

          <button className="btn btn--dark btn--pill edit-pick__done" onClick={close}>
            Done
          </button>
        </div>
      </div>
    </>
  )
}
