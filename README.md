# WE R ABLE

One-page website for [WE R ABLE](https://www.werable.com.au/), an NDIS registered disability
support provider based in Caroline Springs, Victoria.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · no runtime dependencies beyond React.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static prerender
```

## Structure

```
src/
  app/
    layout.tsx        metadata, JSON-LD, fonts, skip link
    page.tsx          section order, top to bottom
    globals.css       design tokens (@theme) + motion layer
  components/         one file per section, plus Icon / Button / Reveal
  content/site.ts     all copy and data, typed
public/assets/
  brand/              logo variants generated from the source artwork
  img/                photography, cropped and re-encoded to WebP
  video/              hero footage, transcoded for the web
```

Content is data, not markup. Services, values, regions and contact details live in
`src/content/site.ts`; the components map over them.

## Design system

Tokens are Tailwind v4 `@theme` variables in `globals.css`.

**Colour** was sampled from the pixels of the brand logo rather than guessed:
navy `#0B2545`, deepest navy `#071C34`, blue `#2576B4`, gold `#F7B60E`, magenta `#C7356C`,
warm off-white `#F7F3EC`. Navy dominates; the other three are accents.

`--color-gold-deep` and `--color-blue-deep` are darkened variants used only for small text, so
every text/background pair on the page clears WCAG AA. The lowest ratio anywhere is 4.96:1.

**Type** is Bricolage Grotesque (display) paired with Inter Tight (body), self-hosted by
`next/font`. Sizes are fluid `clamp()` values on one scale.

**Signature element** is the puzzle tab — a `clip-path` echo of the interlocking heart in the
logo. It appears once, on the hero kicker, rather than above every section.

## Motion

- Section entrances use `Reveal`, which enhances an already-painted default. The server HTML
  contains no hidden state; the component adds `data-reveal="pending"` on mount and an
  `IntersectionObserver` clears it. Without JS the page ships fully visible.
- The hero uses `@starting-style` for its load-in, so its resting state is also the visible one.
- `prefers-reduced-motion` is honoured at both layers: `Reveal` skips the observer entirely, and
  the stylesheet forces `opacity: 1` so no section can be stranded.
- Easing is exponential (`cubic-bezier(0.23, 1, 0.32, 1)`); hover lifts sit behind Tailwind's
  `hover:` variant, which is already wrapped in `@media (hover: hover)`.

## Hero video

The hero is full-bleed: the footage spans the viewport while the copy stays on the page grid.

`public/assets/video/` holds 1080p / 720p / 480p cuts, chosen by a `media` attribute on
`<source>` — the ladder matters because full-bleed upscales the footage to the viewport. The
source was a 12 MB UHD file; transcoded with audio stripped and faststart enabled it is
**1.5 MB** at 1080p, 796 KB at 720p and 359 KB at 480p.

The loop runs longer than five seconds, so WCAG 2.2.2 requires a way to stop it — the pause
control ships with the video, not as an afterthought. Autoplay is skipped entirely when the
visitor prefers reduced motion or has Save-Data on; the poster frame stands in.

## Content accuracy

Every fact on the page comes from werable.com.au. There are no invented statistics,
testimonials, registration numbers or years-in-business.

**Areas served:** the live site publishes no suburb list, only *"different suburbs and localities
around Metro Melbourne"*. The section therefore shows the four metro groupings rather than named
suburbs. To publish the real list, add a `suburbs` array to any entry in the `regions` export —
`AreasServed` already renders it.

## Contact form

Enquiries post to `/api/enquiry`, a route handler that delivers server-side to
**werable.disability@gmail.com**. The destination address is not in the client bundle, so it is
never handed to address-harvesting crawlers. A hidden honeypot field is accepted silently, giving
bots no signal to retry.

Two delivery paths, chosen by configuration:

| Env | Provider | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` set | Resend | Preferred. Proper From address, real deliverability, no third party in between. Needs a verified sender domain; set `ENQUIRY_FROM` to a mailbox on it. |
| nothing set | FormSubmit | No signup, no key. **The first submission triggers a one-time activation email to the destination inbox — nothing is delivered until someone clicks that link.** |

`ENQUIRY_TO` overrides the destination. While activation is pending the API returns
`pendingActivation: true` and the form says delivery is still being set up rather than showing a
false confirmation.

## Video library

`VideoLibrary` shows three click-to-load facades. Each card renders a locally hosted thumbnail
and only mounts a player when asked; YouTube is embedded via `youtube-nocookie.com`. Three live
iframes would otherwise contact Google and Meta on page load, before anyone pressed play.

**Attribution matters here.** Two of the three videos are official NDIS resources published by
the National Disability Insurance Agency and the NDIS Quality and Safeguards Commission — not
WE R ABLE productions. Each card credits its publisher, and a note under the grid states the
distinction and links to ndis.gov.au and ndiscommission.gov.au. For a registered provider,
presenting regulator content as its own would be a compliance problem, not a design detail.

## Facebook section

The Facebook page plugin is click-to-load. Meta's embed sets cookies and reports the visit the
moment it mounts; on a page whose visitors are disclosing disability-related needs, that should
be a choice rather than a default. The placeholder says what loading it does.

## Accessibility

- One `h1`; heading order runs h1 → h2 → h3 → h4 with no skips
- Skip link, semantic landmarks, labelled form controls with `aria-invalid` and adjacent errors
- Every focusable element has a visible focus ring (verified by tabbing all 30 stops)
- Mobile drawer closes on link tap, outside click, Escape (returning focus) and resize
- Hero text was measured against real video frames, not assumed: worst case 6.39:1
- All text meets WCAG AA

## Verification

Checked in headless Chrome over the DevTools Protocol at 375 / 390 / 768 / 1024 / 1440:
no horizontal overflow, no console errors, both fonts loading, all reveals firing, and nothing
hidden under reduced motion.
