'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Edit } from '../actions/inlineEdit'

/**
 * Holds the editing session: whether edit mode is on, and what has been changed
 * but not yet published.
 *
 * Edits are kept in memory until Publish, which is what makes the toolbar's
 * Reset meaningful and stops every keystroke becoming a database write. The
 * cost is that a refresh mid-edit loses unsaved changes — so the toolbar warns
 * before that can happen.
 */

/** A photograph or an icon: a choice, not a sentence. Declared, not discovered. */
export type Region =
  | { kind: 'image'; key: string; mediaId: number | null; alt: string; label: string }
  | { kind: 'icon'; key: string; value: string; options: { label: string; value: string }[] }

/** One already-uploaded photograph, as the picker needs it. */
export type MediaItem = { id: number | string; alt: string; url: string; filename: string }

type EditContextValue = {
  /** path → committed text, for matching against what is on the page. */
  values: Record<string, string>
  /** The regions that cannot be found by looking for their text. */
  regions: Region[]
  /** Everything already uploaded, for the image picker. */
  media: MediaItem[]
  editing: boolean
  setEditing: (on: boolean) => void
  /** Pending edits, keyed by content path. */
  pending: Record<string, Edit>
  stage: (edit: Edit) => void
  discard: () => void
  dirtyCount: number
}

const EditContext = createContext<EditContextValue | null>(null)

export function EditProvider({
  children,
  values,
  regions = [],
  media = [],
  initialEditing = false,
}: {
  children: React.ReactNode
  values: Record<string, string>
  regions?: Region[]
  media?: MediaItem[]
  /**
   * Whether to open already editing. False for anyone who simply loaded a page
   * while signed in; true only for someone who has just come through /edit,
   * where signing in *was* the request to edit.
   */
  initialEditing?: boolean
}) {
  const [editing, setEditing] = useState(initialEditing)
  const [pending, setPending] = useState<Record<string, Edit>>({})

  const stage = useCallback((edit: Edit) => {
    setPending((current) => ({ ...current, [edit.key]: edit }))
  }, [])

  const discard = useCallback(() => setPending({}), [])

  const value = useMemo(
    () => ({
      values,
      regions,
      media,
      editing,
      setEditing,
      pending,
      stage,
      discard,
      dirtyCount: Object.keys(pending).length,
    }),
    [values, regions, media, editing, pending, stage, discard],
  )

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>
}

/**
 * Returns null outside a provider — which is the normal case for a visitor,
 * since the provider only wraps the page for admins. Every consumer treats
 * null as "not editing", so the same components serve both audiences.
 */
export function useEdit(): EditContextValue | null {
  return useContext(EditContext)
}
