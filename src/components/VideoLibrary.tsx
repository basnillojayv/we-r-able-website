'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FacebookIcon, Icon } from './Icon';
import { Reveal } from './Reveal';
import { sections, site, videos } from '@/content/site';

/*
  Click-to-load facades.

  A YouTube iframe contacts Google and sets cookies the moment it mounts, and
  three of them would do it three times before anyone pressed play. So each card
  shows a locally hosted thumbnail and only swaps in the player on request —
  and the player is youtube-nocookie.com when it does arrive. Nothing on this
  page reaches a third party until a visitor asks it to.
*/
export function VideoLibrary() {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section aria-labelledby="videos-title" className="section-y bg-white">
      <div className="shell">
        <Reveal className="mb-[clamp(2.5rem,4.5vw,4rem)] grid items-end gap-[clamp(1.15rem,3vw,3.5rem)] md:grid-cols-[1.05fr_0.95fr]">
          <h2 id="videos-title">{sections.videos.title}</h2>
          <p className="max-w-[56ch] text-lead leading-[1.6] text-muted">
            {sections.videos.intro}
          </p>
        </Reveal>

        <ul className="fold grid gap-[clamp(1rem,2vw,1.5rem)] lg:grid-cols-3">
          {videos.map((video, i) => {
            const live = playing === video.id;
            return (
              <Reveal
                as="li"
                kind="rise"
                delay={i * 90}
                key={video.id}
                className="group overflow-hidden rounded-panel border border-line bg-cream
                  transition-[transform,box-shadow,border-color] duration-300
                  ease-(--ease-out-strong) hover:-translate-y-1 hover:border-line-strong
                  hover:shadow-card motion-reduce:hover:translate-y-0"
              >
                <div className="relative aspect-video bg-ink-deep">
                  {live && video.kind === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 size-full border-0"
                    />
                  ) : live && video.kind === 'facebook' ? (
                    <iframe
                      src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                        video.href,
                      )}&show_text=false&autoplay=true`}
                      title={video.title}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      allowFullScreen
                      scrolling="no"
                      className="absolute inset-0 size-full border-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlaying(video.id)}
                      className="absolute inset-0 grid size-full cursor-pointer place-items-center"
                    >
                      {video.thumb ? (
                        <Image
                          src={video.thumb}
                          alt=""
                          aria-hidden
                          width={960}
                          height={540}
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="absolute inset-0 size-full object-cover opacity-80
                            transition-[opacity,transform] duration-500 ease-(--ease-out-strong)
                            group-hover:opacity-100 group-hover:scale-[1.03]
                            motion-reduce:group-hover:scale-100"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="absolute inset-0 grid place-items-center bg-ink-deep"
                        >
                          <FacebookIcon className="size-12 text-cream/25" />
                        </span>
                      )}
                      <span
                        aria-hidden
                        className="relative grid size-16 place-items-center rounded-full
                          border border-cream/40 bg-ink-deep/70 text-cream backdrop-blur-sm
                          transition-[transform,background-color] duration-300
                          ease-(--ease-out-strong) group-hover:scale-110 group-hover:bg-ink-deep/85
                          motion-reduce:group-hover:scale-100"
                      >
                        <Icon name="play" className="ml-1 size-6" />
                      </span>
                      <span className="sr-only">
                        Play “{video.title}” — loads from {video.source}
                      </span>
                    </button>
                  )}
                </div>

                <div className="grid gap-2 p-[clamp(1.25rem,2.4vw,1.65rem)]">
                  <h3 className="text-[1.0625rem]">{video.title}</h3>
                  <p className="text-[0.8125rem] leading-[1.5] text-muted">{video.body}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem]
                    font-semibold uppercase tracking-[0.1em] text-muted">
                    <span aria-hidden className="puzzle-tab text-line-strong" />
                    {video.credit}
                  </p>
                  <a
                    href={video.href}
                    rel="noopener"
                    className="mt-1 inline-flex w-max items-center gap-1.5 text-[0.8125rem]
                      font-semibold text-blue-deep underline-offset-4 hover:underline"
                  >
                    Watch on {video.source}
                    <Icon name="arrowNe" className="size-3.5" />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <Reveal
          as="p"
          className="mt-[clamp(1.5rem,3vw,2.25rem)] max-w-[70ch] text-small leading-[1.6] text-muted"
        >
          The first two videos are published by the National Disability Insurance Agency and the
          NDIS Quality and Safeguards Commission. They are shared here as reference material and
          are not WE R ABLE productions. For the official versions, see{' '}
          <a
            href="https://www.ndis.gov.au/"
            rel="noopener"
            className="font-semibold text-ink underline underline-offset-2"
          >
            ndis.gov.au
          </a>{' '}
          and{' '}
          <a
            href="https://www.ndiscommission.gov.au/"
            rel="noopener"
            className="font-semibold text-ink underline underline-offset-2"
          >
            ndiscommission.gov.au
          </a>
          . Our own updates are on{' '}
          <a
            href={site.facebook}
            rel="noopener"
            className="font-semibold text-ink underline underline-offset-2"
          >
            Facebook
          </a>
          .
        </Reveal>
      </div>
    </section>
  );
}
