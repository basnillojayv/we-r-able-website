import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Lists the images the in-place editor's picker may choose between.
 *
 * WHY A BUILD-TIME FILE AND NOT `readdir` AT RUNTIME
 * `public/` is served from the CDN and is not reliably present in a Vercel
 * function's filesystem, so a route handler cannot list it. Forcing it in with
 * outputFileTracingIncludes would drag several megabytes of webp and mp4 into
 * the lambda to answer a question that never changes between deploys.
 *
 * Only URLs are recorded. The numeric ids the picker needs are derived from
 * those paths in src/lib/media.ts, so the hash lives in exactly one place and
 * cannot drift between this script and the code that reads it.
 *
 * Run by `prebuild`, and committed — so a fresh clone typechecks without
 * having built first, and the regenerated file is byte-identical.
 */

// fileURLToPath, not .pathname: a repository path containing a space comes
// back percent-encoded from .pathname, and readdir then fails on it.
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const OUT = join(ROOT, "src/content/media.manifest.json");

const IMAGES = /\.(webp|png|jpe?g|avif)$/i;

const list = (dir) =>
  readdirSync(join(PUBLIC, dir))
    .filter((name) => IMAGES.test(name))
    .map((name) => `/${dir}/${name}`)
    .sort();

/**
 * INSTALL: name the folders under public/ the picker may offer.
 *
 * Be sparing. Anything whose size or placement the layout depends on should
 * not be here — a logo with a hand-tuned display width, or a decorative mark
 * the component positions itself. Offering those is offering a choice that
 * cannot come out well.
 */
const PHOTO_DIRS = ["assets/img"];
// Icons here are inline SVG in src/components/Icon.tsx, not files —
// their options come from IconName, so there is no folder to list.
const ICON_DIRS = [];

const manifest = {
  photos: PHOTO_DIRS.flatMap(list),
  icons: ICON_DIRS.flatMap(list),
};

const next = JSON.stringify(manifest, null, 2) + "\n";
const current = (() => {
  try {
    return readFileSync(OUT, "utf8");
  } catch {
    return null;
  }
})();

if (current === next) {
  console.log(`media manifest unchanged — ${manifest.photos.length} photos, ${manifest.icons.length} icons`);
} else {
  writeFileSync(OUT, next, "utf8");
  console.log(`media manifest written — ${manifest.photos.length} photos, ${manifest.icons.length} icons`);
}
