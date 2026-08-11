import Image from 'next/image';
import { Button } from './Button';
import { HeroVideo } from './HeroVideo';

export function Hero() {
  return (
    <section id="home" className="pt-[clamp(1.5rem,3vw,2.5rem)]">
      <div className="shell">
        <div
          className="relative isolate overflow-hidden rounded-hero bg-ink-deep
            min-h-[clamp(520px,72vh,760px)]"
        >
          <HeroVideo />

          {/* Scrim. Two layers: a horizontal wash that keeps the copy column
              legible on wide screens, and a vertical one that takes over when
              the layout stacks. Both land the text well past AA. */}
          <div
            aria-hidden
            className="absolute inset-0 z-10 bg-linear-to-b from-ink-deep/40 from-[4%]
              via-ink-deep/80 via-[46%] to-ink-deep/97
              md:bg-linear-100 md:from-ink-deep md:from-[30%]
              md:via-ink-deep/80 md:via-[54%] md:to-ink-deep/5 md:to-[86%]"
          />

          <Image
            src="/assets/brand/mark-512.png"
            alt=""
            aria-hidden
            width={512}
            height={512}
            className="pointer-events-none absolute -bottom-[14%] -left-[6%] z-10 hidden
              w-[46%] max-w-[340px] opacity-[0.055] md:block"
          />

          <div
            className="relative z-20 grid content-center gap-[clamp(1.25rem,2vw,1.75rem)]
              px-[clamp(1.75rem,3.6vw,4rem)] py-[clamp(3rem,6vw,5.5rem)]
              md:max-w-[min(58%,42rem)]"
          >
            <p className="hero-rise inline-flex items-center gap-2.5 text-eyebrow font-semibold
              uppercase tracking-[0.14em] text-gold">
              <span aria-hidden className="puzzle-tab" />
              NDIS Registered Disability Support Provider
            </p>

            <h1 className="hero-rise text-cream [--d:80ms]">
              We Are Able
              <br />
              To Make A{' '}
              <span className="relative whitespace-nowrap text-gold">
                Difference.
                <span
                  aria-hidden
                  className="absolute -bottom-[0.11em] left-0 right-0 h-[5px] origin-left
                    rounded-[4px] bg-magenta motion-safe:animate-[underline-in_0.7s_var(--ease-out-strong)_0.6s_both]"
                />
              </span>
            </h1>

            <p className="hero-rise max-w-[44ch] text-lead leading-[1.6] text-[#c6d6ea] [--d:160ms]">
              Personalised support that empowers people with disability to live with greater
              independence, confidence and choice.
            </p>

            <div className="hero-rise flex flex-wrap gap-3 [--d:240ms]">
              <Button href="#contact" variant="gold" className="max-sm:w-full">
                Get in Touch
              </Button>
              <Button
                href="#services"
                variant="ghostLight"
                icon="arrowDown"
                className="max-sm:w-full"
              >
                Explore Our Services
              </Button>
            </div>
          </div>

          {/* Sits over the footage on desktop, tucks under the copy on mobile. */}
          <div
            className="hero-rise relative z-20 mx-[clamp(1.75rem,3.6vw,4rem)] mb-8 flex
              flex-wrap items-baseline gap-x-3 gap-y-1 [--d:320ms]
              md:absolute md:bottom-[clamp(4.5rem,7vw,6rem)] md:right-[clamp(1.75rem,4vw,3rem)]
              md:m-0 md:block md:w-max md:max-w-[320px] md:rounded-card md:bg-cream
              md:px-[1.45rem] md:py-[1.05rem] md:shadow-lift"
          >
            <strong className="font-display text-[1.0625rem] tracking-[-0.015em] text-cream md:text-ink">
              Participant-first support
            </strong>
            <span className="block text-[0.8125rem] font-semibold uppercase tracking-[0.06em]
              text-muted-dark md:mt-1 md:text-muted">
              Care <i className="not-italic text-magenta">•</i> Respect{' '}
              <i className="not-italic text-magenta">•</i> Empowerment
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
