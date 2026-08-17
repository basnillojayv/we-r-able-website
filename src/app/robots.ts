import type { MetadataRoute } from "next";

/**
 * `/edit` is disallowed here and also carries `noindex` on the page itself.
 * Both, because robots.txt only stops a crawler that reads it.
 *
 * No `sitemap:` line: there is no sitemap.ts to back it, and pointing a
 * crawler at a 404 is worse than saying nothing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/edit"] },
  };
}
