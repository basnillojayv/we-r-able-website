import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter_Tight } from 'next/font/google';
import './globals.css';
import { site } from '@/content/site';

/* Self-hosted by next/font at build time: no render-blocking request to
   Google, no layout shift, and the fallback metrics are matched automatically. */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display-loaded',
  display: 'swap',
});

const body = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.werable.com.au'),
  title: 'WE R ABLE | NDIS Disability Support Provider Melbourne',
  description:
    'WE R ABLE is an NDIS registered disability support provider in Melbourne providing personalised support that promotes independence, inclusion and choice.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_AU',
    url: '/',
    title: 'WE R ABLE | NDIS Disability Support Provider Melbourne',
    description:
      'Personalised NDIS support across Metro Melbourne that empowers people with disability to live with greater independence, confidence and choice.',
    images: ['/assets/brand/logo-primary@2x.png'],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/assets/brand/mark-512.png', type: 'image/png' }],
    apple: '/assets/brand/apple-touch-icon.png',
  },
};

/* Must match --color-cream in brand.css. Next serialises this into a <meta>
   tag at build time, so it cannot read the custom property; it is the one
   colour in the app that has to be kept in step by hand. */
export const viewport: Viewport = { themeColor: '#F7F3EC' };

const schema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'SocialService'],
  name: site.name,
  description:
    'NDIS registered disability support services provider offering participant-focused support across Metro Melbourne.',
  slogan: site.tagline,
  url: 'https://www.werable.com.au/',
  logo: 'https://www.werable.com.au/assets/brand/logo-primary@2x.png',
  telephone: '+61414877670',
  email: site.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postcode,
    addressCountry: 'AU',
  },
  areaServed: { '@type': 'City', name: 'Melbourne', addressRegion: 'VIC', addressCountry: 'AU' },
  sameAs: [site.facebook],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <a
          href="#main"
          className="skip-link fixed left-1/2 top-0 z-50 -translate-x-1/2 -translate-y-[120%]
            rounded-b-tight bg-ink px-5 py-3 font-semibold text-white
            transition-transform duration-300 ease-(--ease-out-strong)
            focus:translate-y-0"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
