import { isIconName, type IconName } from '@/components/Icon';
import copy from '@/content/copy.json';

/* ==========================================================================
   Every fact here comes from werable.com.au. Nothing is invented — no
   statistics, testimonials, registration numbers or years-in-business.

   THE WORDS LIVE IN copy.json; THE STRUCTURE LIVES HERE.

   The in-place editor at /edit rewrites copy.json and commits it. It rewrites
   JSON and only JSON — regenerating this file would mean generating
   TypeScript, which cannot survive a round trip with its `as const`, its type
   import and these comments intact.

   The split is not tidiness. Anything the code *branches on* stays in
   TypeScript, out of the editor's reach: a Tailwind class, a CSS custom
   property, an anchor target, a YouTube id. To a text matcher, `bg-blue
   text-white` and a sentence look identical — and typed over, the first one
   silently loses a card its colour.
   ========================================================================== */

/* Section headings and intros. These used to be typed straight into the JSX,
   which meant a rebrand touched fourteen component files.

   `titleAccent` is the trailing fragment that renders in the accent colour —
   the components split the heading rather than accepting markup, so no copy
   here is ever interpreted as HTML. */
export const sections = copy.sections;

/* The hero, which used to be hardcoded in Hero.tsx — the largest type on the
   page and the first thing anyone reads, so the least defensible thing to
   leave uneditable. The <h1> is three fields because the markup breaks it
   across a <br> and a coloured span; each fragment is its own text node,
   which is what lets each be edited on its own. */
export const hero = copy.hero;

/* `phone.href` and `facebook` are link targets, not copy: they stay here so
   the editor cannot point them somewhere else. */
export const site = {
  name: copy.site.name,
  tagline: copy.site.tagline,
  phone: { display: copy.site.phoneDisplay, href: 'tel:+61414877670' },
  email: copy.site.email,
  facebook: 'https://www.facebook.com/werablecare/',
  address: copy.site.address,
};

/* Not in copy.json, and deliberately not editable. Each label renders three
   times over — desktop bar, mobile drawer, footer Quick Links — and `href` is
   load-bearing three ways: React key, anchor target, and the selector
   `Header.tsx` hands to `document.querySelector` to drive scroll-spy. */
export const nav = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Areas Served', href: '#areas' },
  { label: 'Contact', href: '#contact' },
] as const;

/* --------------------------------------------------------------------------
   Lists: copy.json holds the words, the arrays below hold everything else,
   and the two are zipped by position. A length mismatch throws at module load
   rather than rendering a row with holes in it.
   ----------------------------------------------------------------------- */
/**
 * Narrow a name from copy.json back to IconName. The JSON import widens to
 * `string`; a cast would hide exactly the failure that matters.
 */
function icon(value: string, where: string): IconName {
  if (!isIconName(value)) throw new Error(`${where}: unknown icon "${value}"`);
  return value;
}

function zip<S, C, R>(
  structure: readonly S[],
  words: readonly C[],
  join: (s: S, c: C, i: number) => R,
): R[] {
  if (structure.length !== words.length) {
    throw new Error(
      `content: copy.json holds ${words.length} rows where the structure has ${structure.length}`,
    );
  }
  return structure.map((s, i) => join(s, words[i], i));
}

export type Trust = { icon: IconName; title: string; body: string; tone: string };

const trustTones = ['text-blue', 'text-magenta', 'text-gold-mid', 'text-ink'];

export const trust: Trust[] = zip(trustTones, copy.trust, (tone, c, i) => ({
  icon: icon(c.icon, `trust[${i}]`),
  title: c.title,
  body: c.body,
  tone,
}));

export type AbleLetter = { letter: string; word: string; body: string; chip: string };

/* The letters are single characters inside aria-hidden spans, and double as
   React keys. Too short to match on safely, and not prose. */
const ableStructure = [
  { letter: 'A', chip: 'bg-blue text-white' },
  { letter: 'B', chip: 'bg-magenta text-white' },
  { letter: 'L', chip: 'bg-gold text-ink' },
  { letter: 'E', chip: 'bg-ink text-white' },
];

export const able: AbleLetter[] = zip(ableStructure, copy.able, (s, c) => ({
  letter: s.letter,
  word: c.word,
  body: c.body,
  chip: s.chip,
}));

export type Pillar = {
  icon: IconName;
  label: string;
  statement: string;
  accent: string;
  values?: string[];
};

/* `accent` is read as two classes — `Values.tsx` does `accent.split(' ')` — so
   it must stay exactly two, which is reason enough to keep it out of a text
   box. */
const pillarStructure = [
  { accent: 'bg-blue text-blue' },
  { accent: 'bg-magenta text-magenta' },
  { accent: 'bg-gold text-gold-mid' },
];

export const pillars: Pillar[] = zip(pillarStructure, copy.pillars, (s, c, i) => ({
  icon: icon(c.icon, `pillars[${i}]`),
  label: c.label,
  statement: c.statement,
  accent: s.accent,
}));

/* "The four words behind our name" — so they are read from the name, rather
   than written down a second time. They used to be a duplicate list, which
   meant two content paths holding the identical four strings: the editor
   would have bound one of each pair to the wrong section. */
pillars[2].values = able.map((a) => a.word);

export type Service = { icon: IconName; title: string; body: string };

export const services: Service[] = copy.services.map((c, i) => ({
  icon: icon(c.icon, `services[${i}]`),
  title: c.title,
  body: c.body,
}));

/* A real sequence — the order the support relationship actually unfolds in —
   which is the only thing that earns numbered markers. `n` is an aria-hidden
   marker and a React key; `ink` is injected as a CSS custom property. */
export type Step = { n: string; title: string; body: string; rule: string; ink: string };

const stepStructure = [
  { n: '01', rule: 'bg-gold', ink: 'var(--color-gold)' },
  { n: '02', rule: 'bg-blue', ink: 'var(--color-blue)' },
  { n: '03', rule: 'bg-magenta', ink: 'var(--color-magenta)' },
  { n: '04', rule: 'bg-cream', ink: 'var(--color-cream)' },
];

export const steps: Step[] = zip(stepStructure, copy.steps, (s, c) => ({
  n: s.n,
  title: c.title,
  body: c.body,
  rule: s.rule,
  ink: s.ink,
}));

/* The live site publishes no suburb list — only "different suburbs and
   localities around Metro Melbourne" — so these are the metro groupings we
   work across, not invented coverage. To publish the real list, add a
   `suburbs` array to any region and AreasServed renders it. */
export type Region = { name: string; body: string; rule: string; suburbs?: string[] };

const regionRules = ['bg-gold', 'bg-blue', 'bg-magenta', 'bg-ink'];

export const regions: Region[] = zip(regionRules, copy.regions, (rule, c) => ({
  name: c.name,
  body: c.body,
  rule,
}));

/* The first two are official NDIS resources published on the NDIA and
   Commission YouTube channels — credited as theirs, not presented as ours.
   The third is WE R ABLE's own reel. Thumbnails are hosted locally so no
   third party is contacted before a visitor presses play.

   `id`, `kind` and `href` are the embed itself: the id goes straight into the
   YouTube URL and `kind` chooses which player renders. */
export type Video = {
  id: string;
  kind: 'youtube' | 'facebook';
  title: string;
  body: string;
  credit: string;
  source: string;
  href: string;
  thumb?: string;
};

const videoStructure: Pick<Video, 'id' | 'kind' | 'href'>[] = [
  { id: 'OQWeTiFaheI', kind: 'youtube', href: 'https://youtu.be/OQWeTiFaheI' },
  {
    id: 'nFIeHFazBuI',
    kind: 'youtube',
    href: 'https://www.youtube.com/watch?v=nFIeHFazBuI',
  },
  {
    id: 'reel-1193331752879761',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/1193331752879761/',
  },
];

export const videos: Video[] = zip(videoStructure, copy.videos, (s, c) => ({
  ...s,
  title: c.title,
  body: c.body,
  credit: c.credit,
  source: c.source,
  ...('thumb' in c && c.thumb ? { thumb: c.thumb } : {}),
}));

/* Rendered as <option> text and POSTed into the enquiry subject line. In
   copy.json so the wording lives with the rest of it, but not offered to the
   inline editor: a contentEditable span inside an <option> breaks the select.
   The `{ text }` wrappers are what the editor's array walk needs to address a
   row at all; unwrapped here so consumers still see string[]. */
export const enquiryTopics: string[] = copy.enquiryTopics.map((row) => row.text);
