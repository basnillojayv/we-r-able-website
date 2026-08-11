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
  const userPaused = useRef(false);

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

    /* iOS Safari routinely refuses the first play() — hydration fires before the
       media pipeline has any data, and a backgrounded or still-painting tab is
       refused outright. One attempt left the poster up for good on iPhones, so
       ask again whenever the element or the page says it is in a better state.
       Anything short of Low Power Mode, which blocks autoplay unconditionally,
       recovers on one of these. */
    el.muted = true; // iOS reads the property, not the attribute, at play() time
    el.preload = 'auto'; // only now that we know we intend to play it

    let done = false;
    let tries = 0;
    const attempt = () => {
      if (done || userPaused.current) return;
      if (!el.paused) {
        done = true;
        setPlaying(true);
        return;
      }
      el.play().then(
        () => {
          done = true;
          setPlaying(true);
        },
        () => setPlaying(false), // still blocked — poster stays, control offers play
      );
    };

    attempt();
    /* The events below only fire if the element was not already ready when this
       effect ran. When it was, nothing further fires and a single refusal would
       stick — so poll briefly as well. */
    const poll = setInterval(() => {
      if (done || ++tries > 10) clearInterval(poll);
      else attempt();
    }, 300);
    el.addEventListener('loadeddata', attempt);
    el.addEventListener('canplay', attempt);
    document.addEventListener('visibilitychange', attempt);
    // Last resort: any gesture carries the activation iOS was holding out for.
    const gestures = ['touchstart', 'pointerdown'] as const;
    gestures.forEach((g) => document.addEventListener(g, attempt, { passive: true }));

    return () => {
      done = true;
      clearInterval(poll);
      el.removeEventListener('loadeddata', attempt);
      el.removeEventListener('canplay', attempt);
      document.removeEventListener('visibilitychange', attempt);
      gestures.forEach((g) => document.removeEventListener(g, attempt));
    };
  }, []);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      el.play().then(() => setPlaying(true), () => setPlaying(false));
    } else {
      userPaused.current = true; // don't let a later retry override the choice
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
