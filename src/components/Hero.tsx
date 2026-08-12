import { Button } from './Button';
import { HeroVideo } from './HeroVideo';

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-ink-deep
        min-h-[clamp(560px,80vh,860px)] flex flex-col justify-center
        pt-[clamp(3rem,7vw,6rem)] pb-[clamp(5rem,9vw,8rem)]"
    >
      <HeroVideo />

      {/* Scrim. A horizontal wash carries the copy column on wide screens; a
          vertical one takes over when the layout stacks. Both are measured
          against real frames of the footage, not eyeballed. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-linear-to-b from-ink-deep/45 from-[4%]
          via-ink-deep/82 via-[46%] to-ink-deep/97
          md:bg-linear-100 md:from-ink-deep md:from-[26%]
          md:via-ink-deep/78 md:via-[52%] md:to-ink-deep/8 md:to-[88%]"
      />

      {/* A last touch of weight at the foot, so the trust strip has something
          to sit against rather than floating on open footage. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-t from-ink-deep/70 to-transparent"
      />

      <div className="shell relative z-20">
        <div className="grid content-center gap-[clamp(1.25rem,2vw,1.75rem)] md:max-w-[min(60%,44rem)]">
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

          <p className="hero-rise max-w-[46ch] text-lead leading-[1.6] text-ink-faint [--d:160ms]">
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
      </div>

      {/* Flows under the copy on narrow screens; on wide ones it steps out
          over the footage, where there is finally room for it. Positioned
          against the section, so it tracks the page gutter either way. */}
      <div
        className="hero-rise relative z-20 mt-9 flex flex-wrap items-baseline gap-x-3 gap-y-1
          px-[clamp(1.25rem,4.4vw,3rem)] [--d:320ms]
          lg:absolute lg:bottom-[clamp(5.5rem,9vw,7.5rem)]
          lg:right-[clamp(1.25rem,4.4vw,3rem)] lg:mt-0 lg:block lg:w-max lg:max-w-[320px]
          lg:rounded-card lg:bg-cream lg:px-[1.45rem] lg:py-[1.05rem] lg:shadow-lift"
      >
        <strong className="font-display text-[1.0625rem] tracking-[-0.015em] text-cream lg:text-ink">
          Participant-first support
        </strong>
        <span className="block text-[0.8125rem] font-semibold uppercase tracking-[0.06em]
          text-muted-dark lg:mt-1 lg:text-muted">
          Care <i className="not-italic text-magenta">•</i> Respect{' '}
          <i className="not-italic text-magenta">•</i> Empowerment
        </span>
      </div>
    </section>
  );
}
