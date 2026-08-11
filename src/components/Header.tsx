'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { nav, site } from '@/content/site';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');
  const burger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = nav
      .map((n) => document.querySelector(n.href))
      .filter((el): el is Element => Boolean(el));
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      burger.current?.focus();
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-[14px] backdrop-saturate-150 border-b
        transition-[background-color,border-color] duration-300 ease-(--ease-out-strong)
        ${scrolled ? 'bg-cream/95 border-line' : 'bg-cream/85 border-transparent'}`}
    >
      <div
        className={`shell flex items-center justify-between gap-6
          transition-[min-height] duration-300 ease-(--ease-out-strong)
          ${scrolled ? 'min-h-[70px]' : 'min-h-[84px]'}`}
      >
        <a href="#home" aria-label={`${site.name} — home`} className="shrink-0">
          <Image
            src="/assets/brand/logo-primary.png"
            alt={site.name}
            width={560}
            height={374}
            priority
            sizes="112px"
            className={`w-auto origin-left transition-transform duration-300 ease-(--ease-out-strong)
              ${scrolled ? 'h-16 scale-[0.85]' : 'h-16'}`}
          />
        </a>

        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
          {nav.map((item) => {
            const current = active === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={current ? 'true' : undefined}
                className={`group relative px-3.5 py-2 rounded-full text-[0.9375rem]
                  transition-colors duration-200 ease-(--ease-out-strong)
                  ${current ? 'text-ink font-semibold' : 'text-muted font-medium hover:text-ink'}`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute left-3.5 right-3.5 bottom-1 h-0.5 rounded-sm bg-gold origin-left
                    transition-transform duration-200 ease-(--ease-out-strong)
                    ${current ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden lg:flex">
          <Button href="#contact" variant="dark" className="min-h-[46px] px-5">
            Contact Us
          </Button>
        </div>

        <button
          ref={burger}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          className="lg:hidden grid place-items-center size-12 rounded-[14px] border-[1.5px]
            border-line-strong cursor-pointer transition-colors duration-200
            ease-(--ease-out-strong) hover:border-ink active:scale-[0.96]"
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden className="relative block w-5">
            <span
              className={`absolute left-0 block h-[1.75px] w-5 rounded-sm bg-ink
                transition-transform duration-300 ease-(--ease-out-strong)
                ${open ? 'top-0 rotate-45' : '-top-1.5'}`}
            />
            <span
              className={`block h-[1.75px] w-5 rounded-sm transition-colors duration-100
                ${open ? 'bg-transparent' : 'bg-ink'}`}
            />
            <span
              className={`absolute left-0 block h-[1.75px] w-5 rounded-sm bg-ink
                transition-transform duration-300 ease-(--ease-out-strong)
                ${open ? 'top-0 -rotate-45' : 'top-1.5'}`}
            />
          </span>
        </button>
      </div>

      {/* Drawer. Exit is faster than enter — the system should feel quicker to
          get out of the way than it was to arrive. */}
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}
        className={`lg:hidden fixed inset-x-0 bottom-0 top-[84px] z-30 grid content-start gap-1
          overflow-y-auto bg-cream px-[clamp(1.25rem,4.4vw,3rem)] pt-6 pb-10
          transition-[opacity,transform,visibility] ease-(--ease-out-strong)
          ${
            open
              ? 'visible opacity-100 translate-y-0 duration-[240ms]'
              : 'invisible opacity-0 -translate-y-2 duration-[160ms]'
          }`}
      >
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center justify-between border-b border-line px-1 py-4
              font-display text-[1.4rem] font-semibold tracking-[-0.02em]
              transition-colors duration-200 hover:text-blue-deep"
          >
            {item.label}
            <Icon name="arrowNe" className="size-[18px] text-gold-deep" />
          </a>
        ))}
        <Button href="#contact" variant="gold" className="mt-7 w-full">
          Contact Us
        </Button>
        <div className="mt-6 grid gap-1.5 text-small text-muted">
          <span>
            Call us{' '}
            <a href={site.phone.href} className="font-semibold text-ink">
              {site.phone.display}
            </a>
          </span>
          <span>Caroline Springs, VIC — supporting Metro Melbourne</span>
        </div>
      </nav>
    </header>
  );
}
