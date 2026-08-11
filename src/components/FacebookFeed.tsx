'use client';

import { useState } from 'react';
import { FacebookIcon, Icon } from './Icon';
import { site } from '@/content/site';

const PAGE_PLUGIN =
  'https://www.facebook.com/plugins/page.php' +
  `?href=${encodeURIComponent(site.facebook)}` +
  '&tabs=timeline&width=500&height=640&small_header=false' +
  '&adapt_container_width=true&hide_cover=false&show_facepile=true';

/*
  Click-to-load, deliberately.

  Facebook's page plugin sets Meta cookies and reports the visit the moment it
  mounts. Loading that before anyone asks would make every visitor to an NDIS
  provider's site legible to an ad network — a poor trade on a page whose
  audience is disclosing disability-related needs. So the embed sits behind an
  explicit choice, and the copy says what the choice does.
*/
export function FacebookFeed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section aria-labelledby="facebook-title" className="section-y bg-cream">
      <div className="shell grid items-start gap-[clamp(2.25rem,4.5vw,4.5rem)] lg:grid-cols-[0.82fr_1fr]">
        <div className="grid gap-[1.15rem]">
          <h2 id="facebook-title">Follow along on Facebook</h2>
          <p className="max-w-[52ch] text-lead leading-[1.6] text-muted">
            Day-to-day updates from our team — activities, community outings and news — are posted
            to our page.
          </p>
          <a
            href={site.facebook}
            rel="noopener"
            className="group inline-flex w-max items-center gap-2.5 rounded-full border-[1.5px]
              border-line-strong px-5 py-3 text-[0.9375rem] font-semibold
              transition-[border-color,transform,box-shadow] duration-200 ease-(--ease-out-strong)
              hover:-translate-y-0.5 hover:border-ink hover:shadow-card
              motion-reduce:hover:translate-y-0"
          >
            <FacebookIcon className="size-[18px] text-blue" />
            facebook.com/werablecare
            <Icon
              name="arrowNe"
              className="size-4 transition-transform duration-200 ease-(--ease-out-strong)
                group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
            />
          </a>
        </div>

        <div className="overflow-hidden rounded-panel border border-line bg-white">
          {loaded ? (
            <iframe
              src={PAGE_PLUGIN}
              title="WE R ABLE on Facebook"
              loading="lazy"
              scrolling="no"
              allow="encrypted-media"
              className="h-[640px] w-full border-0"
            />
          ) : (
            <div className="grid place-items-center gap-4 px-6 py-14 text-center">
              <FacebookIcon className="size-9 text-blue" />
              <p className="max-w-[42ch] text-small leading-[1.6] text-muted">
                Our Facebook posts load from Meta&rsquo;s servers, which sets their cookies and
                tells them you visited this page. We&rsquo;ll only do that if you ask.
              </p>
              <button
                type="button"
                onClick={() => setLoaded(true)}
                className="group inline-flex min-h-[52px] cursor-pointer items-center gap-2.5
                  rounded-full border-[1.5px] border-ink bg-ink px-6 text-[0.9688rem]
                  font-semibold text-white transition-[transform,background-color,box-shadow]
                  duration-200 ease-(--ease-out-strong) hover:-translate-y-0.5 hover:bg-ink-mid
                  hover:shadow-card active:scale-[0.97] active:duration-100
                  motion-reduce:hover:translate-y-0"
              >
                Load our Facebook posts
                <Icon
                  name="arrowRight"
                  className="size-[17px] transition-transform duration-200
                    ease-(--ease-out-strong) group-hover:translate-x-[3px]"
                />
              </button>
              <p className="text-[0.8125rem] text-muted">
                Or{' '}
                <a
                  href={site.facebook}
                  rel="noopener"
                  className="font-semibold text-ink underline underline-offset-2"
                >
                  open the page on Facebook
                </a>{' '}
                instead.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
