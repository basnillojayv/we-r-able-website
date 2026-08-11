'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

/*
  Decorative background footage: muted, looping, no audio track at all.

  WCAG 2.2.2 requires a mechanism to pause any motion that plays automatically
  for more than five seconds. This loop runs ten, so the control is not a nicety
  — it ships with the video. It matters more here than on most sites: motion
  sensitivity and vestibular disorders are common among the people this page is
  written for.
*/
export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    const quiet = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saveData = (navigator as any).connection?.saveData === true;

    if (quiet || saveData) {
      setPlaying(false);
      return; // poster stays; the visitor can start it themselves
    }

    el.play().then(
      () => setPlaying(true),
      () => setPlaying(false), // autoplay blocked — poster stays, control offers play
    );
  }, []);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true), () => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={video}
        aria-hidden
        tabIndex={-1}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/video/hero-poster.webp"
        onLoadedData={() => setReady(true)}
        className={`absolute inset-0 size-full object-cover object-[58%_38%]
          transition-opacity duration-700 ease-(--ease-out-strong)
          ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Full-bleed means the footage is upscaled to the viewport, so the
            width ladder matters more than it would inside a card. */}
        <source src="/assets/video/hero-1080.mp4" media="(min-width: 1280px)" type="video/mp4" />
        <source src="/assets/video/hero-720.mp4" media="(min-width: 768px)" type="video/mp4" />
        <source src="/assets/video/hero-480.mp4" type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={!playing}
        className="group absolute bottom-5 right-[clamp(1.25rem,4.4vw,3rem)] z-30 grid size-11
          place-items-center md:bottom-auto md:top-6
          rounded-full border border-cream/35 bg-ink-deep/55 text-cream backdrop-blur-sm
          cursor-pointer transition-[background-color,border-color,transform] duration-200
          ease-(--ease-out-strong) hover:bg-ink-deep/80 hover:border-cream/70
          active:scale-[0.94]"
      >
        <Icon name={playing ? 'pause' : 'play'} className="size-[18px]" />
        <span className="sr-only">
          {playing ? 'Pause background video' : 'Play background video'}
        </span>
      </button>
    </>
  );
}
