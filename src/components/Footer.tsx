import Image from 'next/image';
import { FacebookIcon } from './Icon';
import { nav, site } from '@/content/site';

export function Footer() {
  return (
    <footer className="on-dark bg-ink-deep pb-8 pt-[clamp(3rem,5.5vw,4.5rem)] text-muted-dark">
      <div className="shell">
        <div
          className="grid gap-[clamp(2rem,4vw,4rem)] border-b border-line-dark
            pb-[clamp(2rem,4vw,3rem)] sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr]"
        >
          <div>
            <Image
              src="/assets/brand/logo-onDark.png"
              alt={site.name}
              width={560}
              height={374}
              sizes="234px"
              className="h-[78px] w-auto"
            />
            <p className="mt-5 max-w-[24ch] font-display text-[1.125rem] font-medium
              leading-[1.35] tracking-[-0.015em] text-cream">
              {site.tagline}
            </p>
          </div>

          <nav aria-labelledby="footer-links-title">
            <h2
              id="footer-links-title"
              className="mb-[1.1rem] font-body text-[0.75rem] font-bold uppercase
                tracking-[0.14em] text-cream"
            >
              Quick Links
            </h2>
            <ul className="grid gap-2.5 text-small">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="transition-colors duration-200 ease-(--ease-out-strong) hover:text-gold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2
              id="footer-contact-title"
              className="mb-[1.1rem] font-body text-[0.75rem] font-bold uppercase
                tracking-[0.14em] text-cream"
            >
              Contact
            </h2>
            <address aria-labelledby="footer-contact-title" className="grid gap-3 not-italic text-small">
              <span>
                {site.address.locality}, {site.address.region} {site.address.postcode}
              </span>
              <a href={site.phone.href} className="transition-colors duration-200 hover:text-gold">
                {site.phone.display}
              </a>
              <a href={`mailto:${site.email}`} className="transition-colors duration-200 hover:text-gold">
                {site.email}
              </a>
            </address>
            <a
              href={site.facebook}
              rel="noopener"
              className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-line-dark
                py-2 pl-3 pr-4 text-small font-semibold text-cream
                transition-[background-color,border-color,transform] duration-200
                ease-(--ease-out-strong) hover:border-cream hover:bg-cream/[0.07]
                hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              <FacebookIcon className="size-[18px]" />
              Facebook
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-7 text-[0.8125rem]">
          <p>© {new Date().getFullYear()} {site.name}. All Rights Reserved.</p>
          <p>
            <span aria-hidden className="mr-2 inline-block size-1.5 rounded-full bg-gold align-[0.12em]" />
            NDIS Registered Provider
          </p>
        </div>
      </div>
    </footer>
  );
}
