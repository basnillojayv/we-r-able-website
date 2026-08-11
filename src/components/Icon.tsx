import type { SVGProps } from 'react';

/* One stroke system: 24px grid, 1.5 weight, round caps and joins.
   Hand-drawn rather than pulled from a set, so the household "sparkle" and the
   nursing fob watch read as the same hand as the puzzle tab in the logo. */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const paths = {
  arrowRight: <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" strokeWidth={1.8} />,
  arrowDown: <path d="M12 4v15m0 0-5.5-5.5M12 19l5.5-5.5" strokeWidth={1.8} />,
  arrowNe: <path d="M7 17 17 7m0 0H9m8 0v8" strokeWidth={1.8} />,

  verified: (
    <>
      <path d="M12 2.75l2.35 1.72 2.9-.06.9 2.76 2.35 1.7-.94 2.75.94 2.75-2.35 1.7-.9 2.76-2.9-.06L12 21.25l-2.35-1.72-2.9.06-.9-2.76-2.35-1.7.94-2.75-.94-2.75 2.35-1.7.9-2.76 2.9.06z" />
      <path d="M8.9 12.2l2.1 2.1 4.1-4.4" />
    </>
  ),
  personHeart: (
    <>
      <circle cx="9.5" cy="6.75" r="3.25" />
      <path d="M3.25 20.5v-1.25a5 5 0 0 1 5-5h2.4" />
      <path d="M17.6 13.35c.95-.95 2.5-.95 3.4 0 .9.95.9 2.5 0 3.45L17.6 20.5l-3.4-3.7c-.9-.95-.9-2.5 0-3.45.9-.95 2.45-.95 3.4 0z" />
    </>
  ),
  handsHeart: (
    <>
      <path d="M12 8.4c1-1.1 2.75-1.1 3.75 0 1 1.1 1 2.85 0 3.95L12 16.6l-3.75-4.25c-1-1.1-1-2.85 0-3.95 1-1.1 2.75-1.1 3.75 0z" />
      <path d="M4.5 11.25 2.9 12.9a2.4 2.4 0 0 0 0 3.35l3.6 3.65a2.3 2.3 0 0 0 1.65.7h7.7a2.3 2.3 0 0 0 1.65-.7l3.6-3.65a2.4 2.4 0 0 0 0-3.35l-1.6-1.65" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s7-6.2 7-11.25A7 7 0 0 0 5 10.25C5 15.3 12 21.5 12 21.5z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21.5V3.2" />
      <path d="M5.5 4.1c4.3-1.8 8.7 1.8 13 0v8.6c-4.3 1.8-8.7-1.8-13 0z" />
    </>
  ),
  horizon: (
    <>
      <path d="M2.5 16.5h19" />
      <path d="M6.6 16.5a5.4 5.4 0 0 1 10.8 0" />
      <path d="M12 4.2v2.1M19.2 7.1l-1.5 1.5M4.8 7.1l1.5 1.5" />
    </>
  ),
  heartCore: (
    <>
      <path d="M12 20.5 4.9 13.1a4.6 4.6 0 0 1 0-6.3 4.2 4.2 0 0 1 6.1 0l1 1 1-1a4.2 4.2 0 0 1 6.1 0 4.6 4.6 0 0 1 0 6.3z" />
      <path d="M12 8.2v4.1m-2 0h4" />
    </>
  ),

  transport: (
    <>
      <path d="M3.5 15.5v-3.1L5.7 7a2 2 0 0 1 1.85-1.25h8.9A2 2 0 0 1 18.3 7l2.2 5.4v3.1" />
      <path d="M3.5 15.5h17" />
      <path d="M6 15.5v1.9M18 15.5v1.9" />
      <circle cx="7.2" cy="18.6" r="1.5" />
      <circle cx="16.8" cy="18.6" r="1.5" />
      <path d="M6.6 12.1h10.8" />
    </>
  ),
  sharedLiving: (
    <>
      <path d="M3.2 10.6 12 3.7l8.8 6.9v9.2a1 1 0 0 1-1 1H4.2a1 1 0 0 1-1-1z" />
      <circle cx="9.4" cy="13.1" r="1.7" />
      <circle cx="14.9" cy="14.2" r="1.4" />
      <path d="M6.6 20.8v-.9a2.8 2.8 0 0 1 5.6 0v.9M12.9 20.8v-.6a2.3 2.3 0 0 1 4.5 0v.6" />
    </>
  ),
  household: (
    <>
      <path d="M4 11 12 4.2l8 6.8v8.6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M9 20.6v-5.2h6v5.2" />
      <path d="M17.6 5.6l.55 1.5 1.5.55-1.5.55-.55 1.5-.55-1.5-1.5-.55 1.5-.55z" />
    </>
  ),
  lifeSkills: (
    <>
      <path d="M3.5 19.5h4v-4h4v-4.5h4V6h4.5" />
      <circle cx="7.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="11" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  personal: (
    <>
      <path d="M12.2 11.4c.85-.9 2.25-.9 3.1 0 .85.9.85 2.35 0 3.25l-3.1 3.3-3.1-3.3c-.85-.9-.85-2.35 0-3.25.85-.9 2.25-.9 3.1 0z" />
      <path d="M4.6 20.8v-2.2a4.1 4.1 0 0 1 1.5-3.2" />
      <circle cx="7.4" cy="6.4" r="2.9" />
      <path d="M14.6 8.1a3 3 0 0 0 2.8-3 3 3 0 0 0-2.8-3" />
    </>
  ),
  highIntensity: (
    <>
      <path d="M12 21.3c4.6-1.9 6.9-5.2 6.9-9.9V5.6L12 3.1 5.1 5.6v5.8c0 4.7 2.3 8 6.9 9.9z" />
      <path d="M7.9 12.2h2.3l1.1-2.4 1.5 4.4 1.1-2h2.2" />
    </>
  ),
  nursing: (
    <>
      <path d="M6.4 3.6v4.6a5.6 5.6 0 0 0 11.2 0V3.6" />
      <path d="M4.6 3.6h3.6M15.8 3.6h3.6" />
      <path d="M12 13.8v2.6a4 4 0 0 0 4 4h.6" />
      <circle cx="18.4" cy="20.4" r="1.8" />
    </>
  ),
  community: (
    <>
      <circle cx="12" cy="5.4" r="2.4" />
      <circle cx="5.2" cy="17.2" r="2.4" />
      <circle cx="18.8" cy="17.2" r="2.4" />
      <path d="M10.3 7.4 6.9 14.9M13.7 7.4l3.4 7.5M7.6 18.3h8.8" />
    </>
  ),
  activities: (
    <>
      <rect x="3.4" y="5.4" width="17.2" height="15.2" rx="2.2" />
      <path d="M3.4 10h17.2M8.2 3.4v3.6M15.8 3.4v3.6" />
      <circle cx="9" cy="14.3" r="1.3" />
      <circle cx="15" cy="14.3" r="1.3" />
      <path d="M7 18.4a2.6 2.6 0 0 1 4 0M13 18.4a2.6 2.6 0 0 1 4 0" />
    </>
  ),

  phone: (
    <path d="M7.4 3.5h-.9A2.6 2.6 0 0 0 4 6.2c.3 4.3 2 8 4.8 10.8s6.5 4.5 10.8 4.8a2.6 2.6 0 0 0 2.7-2.5v-.9a1.7 1.7 0 0 0-1.2-1.6l-2.9-1a1.7 1.7 0 0 0-1.8.5l-1 1.1a13.4 13.4 0 0 1-5.8-5.8l1.1-1a1.7 1.7 0 0 0 .5-1.8l-1-2.9a1.7 1.7 0 0 0-1.6-1.2z" />
  ),
  mail: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2.2" />
      <path d="m3.6 6.7 7.2 5.6a2 2 0 0 0 2.4 0l7.2-5.6" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9.2" strokeWidth={1.8} />
      <path d="M12 7.6v5.2M12 16.3h.01" strokeWidth={1.8} />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9.2" strokeWidth={1.7} />
      <path d="M12 11v5.4M12 7.7h.01" strokeWidth={1.7} />
    </>
  ),
  play: <path d="M8.5 5.6 18.6 12 8.5 18.4z" strokeWidth={1.6} />,
  pause: <path d="M9.4 5.8v12.4M14.6 5.8v12.4" strokeWidth={1.8} />,
} as const;

export type IconName = keyof typeof paths;

/* Facebook is a brand glyph — filled, not part of the stroke system. */
export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.77l-.44 2.91h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94z" />
    </svg>
  );
}

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...S} aria-hidden focusable="false" {...props}>
      {paths[name]}
    </svg>
  );
}
