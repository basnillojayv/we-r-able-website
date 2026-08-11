'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

type Kind = 'fade' | 'rise' | 'wipe';

/*
  Entrance motion that enhances an already-painted default.

  The server renders the element with no `data-reveal` attribute, so it is fully
  visible in the HTML. On mount this component sets `data-reveal="pending"`,
  which is the only thing that hides it, then an IntersectionObserver clears it
  to play the transition. If JS never runs — headless render, crawler, a hidden
  tab where transitions are paused — the section still ships visible instead of
  blank.
*/
export function Reveal({
  as: Tag = 'div',
  kind = 'fade',
  delay = 0,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  kind?: Kind;
  delay?: number;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) return;

    // Someone who has asked for less motion gets none of this: the content is
    // already painted, so the correct behaviour is to leave it alone entirely
    // rather than hide it and fade it back.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Already on screen at mount (above the fold): let it paint, don't animate.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.9 && box.bottom > 0) return;

    el.dataset.reveal = 'pending';

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).removeAttribute('data-reveal');
          io.unobserve(entry.target);
        }
      },
      // threshold 0: any sliver counts. A percentage threshold silently never
      // fires for elements taller than the shrunken root, which strands them.
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal-kind={kind === 'fade' ? undefined : kind}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
