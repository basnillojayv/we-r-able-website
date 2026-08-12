# Using this as a template

This started as the WE R ABLE site and has been factored so it can be restood
up for another client. Read this before you fork it.

**What you are actually reusing is the accessibility and performance spine**, not
the layout. The layout is a one-page service business site and it's fine, but
it's replaceable. The parts that are hard to get right, and that most templates
get wrong, are:

- reveals that enhance an already-painted default, so a section can never ship
  blank when JS fails, a crawler renders it, or a tab is backgrounded
- scroll-linked motion that costs zero JavaScript and is genuinely absent under
  `prefers-reduced-motion`, not merely faster
- a token set where every text/surface pair is measured against WCAG AA
- a server-side form route that keeps the destination inbox out of the client
  bundle and tells the visitor the truth when delivery fails
- third-party embeds (YouTube, Facebook) behind an explicit click, so no visitor
  is reported to an ad network before they ask

Keep that spine. Change everything above it.

---

## The two files

A rebrand is mostly these:

| File | What's in it |
|---|---|
| `src/app/brand.css` | Every colour, font, type step, radius, shadow, easing |
| `src/content/site.ts` | Every word and every list on the page |

Everything else reads from those. `globals.css` holds base styles, utilities and
the motion system and should not need per-client edits.

## Three values that can't read a token

These are the leaks. They are the only colours in the app that must be updated
by hand, and all three are commented at their definition:

1. `themeColor` in `src/app/layout.tsx` — Next serialises it into a `<meta>` tag
   at build time. Match `--color-cream`.
2. The `select-chevron` data: URI in `globals.css` — a `data:` URL can't
   interpolate a custom property. Re-encode the stroke to the new `--color-muted`.
3. `--color-*` values in `brand.css` itself, obviously.

## Order of work

1. **`brand.css`** — replace the palette. Then **re-measure contrast**; don't
   trust the ratios in the comments, they describe the WE R ABLE colours. Every
   pair in that file is currently AA or better and the point is to keep it that
   way. There's a checker in step 6.
2. **`site.ts`** — `site` (name, phone, email, address, social), `sections`
   (headings and intros), then the lists: `nav`, `trust`, `able`, `pillars`,
   `services`, `steps`, `regions`, `videos`, `enquiryTopics`.
3. **`layout.tsx`** — metadata, Open Graph, and the JSON-LD `schema` object.
   The schema currently declares `LocalBusiness` + `SocialService`; change the
   types if the client isn't a service provider.
4. **`public/assets/`** — logo variants, photography (WebP, pre-sized), hero
   video (three widths + poster), favicon and apple-touch-icon.
5. **Fonts** — `layout.tsx` loads Bricolage Grotesque + Inter Tight via
   `next/font`. Swap the imports and the `--font-*-loaded` variables follow.
6. **Verify** — see below. Non-optional.

## Components that are client-specific, not generic

Be honest about these when you quote the work. They are not parameterised and
pretending otherwise will cost you a day:

- **`MelbourneMap.tsx`** — a hand-drawn SVG of Port Phillip Bay with a pin on
  Caroline Springs. Its *colours* are tokenised, so it re-skins; its *geography*
  does not. For a client outside Melbourne, redraw it or drop the panel.
- **`puzzle-tab`** in `globals.css` — a `clip-path` echo of the interlocking
  heart in the WE R ABLE logo. It is that brand's signature and should not
  survive into another client's site. Replace the path or delete the utility.
- **`Values.tsx`** — built around A-B-L-E as an acronym of the client's name.
  Only reusable if the next client's name also spells something.
- **`FacebookFeed.tsx` / `VideoLibrary.tsx`** — the click-to-load mechanism is
  fully reusable; the NDIS/NDIA framing copy is not.
- **`api/enquiry/route.ts`** — reusable, but the default `ENQUIRY_TO` is
  hard-coded to the WE R ABLE inbox. Change it or always set the env var.

## Verify before you ship

The template's value is the spine, so check the spine. All of these were run on
this codebase and passed; a rebrand can break any of them.

- **Contrast** — every text/background pair at AA (4.5:1 body, 3:1 large).
- **Reduced motion** — with `prefers-reduced-motion: reduce`, confirm zero
  animations are attached and nothing sits at `opacity: 0`. The hero is the trap:
  its poster is painted by the `<video>` element, so anything that hides the
  video hides the image too.
- **Text zoom** — 200% root font size. *Known outstanding issue on this
  codebase:* five sections overflow horizontally by up to 193px at 200%. Grid
  items take their automatic minimum from `min-content`, and long unbreakable
  tokens (an email address renders 445px wide at 2×) exceed the content box. Fix
  with `min-width: 0` on the grid children before reusing this.
- **Responsive** — no horizontal overflow from 320px to 1920px. Currently clean.
- **Without JavaScript** — every section must still be visible.
- **The form** — submit it and confirm the mail actually arrives. See
  `.env.example`; without `RESEND_API_KEY` it silently falls back to a relay that
  delivers nothing until activated.

## Known gaps to fix once, in the template

Inherited from the WE R ABLE build and worth fixing here rather than per client:

- 200% zoom overflow (above) — the one real accessibility defect left.
- Footer nav links are 39×19px. They scrape past WCAG 2.2 §2.5.8 on the spacing
  exception but miss the 44px target this project set for itself.
- `hero-poster.webp` is 195KB, 38% of total page weight.
- Nine identical service cards and three identical purpose cards. It works, but
  it's the most template-looking thing on the page — worth redesigning once so
  every client site doesn't inherit the same card grid.

## What PRODUCT.md is for

`PRODUCT.md` is the strategic brief — register, users, brand personality,
anti-references, design principles, accessibility commitments. It is currently
filled in for WE R ABLE. Rewrite it per client *before* designing, not after.
The `/impeccable` commands read it, and its "Design Principles" section is what
stops a rebrand from drifting into a generic provider site.
