/**
 * Site-level facts the editor's sign-in panel needs before it knows anything
 * about the content. Separate from the content module because /edit renders
 * the panel alone and must not pull the whole page's copy in.
 */
export const site = {
  name: "WE R ABLE",
} as const;
