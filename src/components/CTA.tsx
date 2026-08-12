import { Button } from './Button';
import { Reveal } from './Reveal';

export function CTA() {
  return (
    <section aria-labelledby="cta-title" className="bg-gold py-[clamp(3.5rem,6.5vw,6rem)]">
      <div className="fold fold-wide shell grid items-center gap-[clamp(1.75rem,4vw,4rem)] md:grid-cols-[1fr_auto]">
        <Reveal>
          <h2 id="cta-title" className="max-w-[16ch] text-ink">
            Let&rsquo;s Make A Difference Together.
          </h2>
          <p className="mt-4 max-w-[48ch] text-lead leading-[1.55] text-ink/80">
            Whether you&rsquo;re looking for support for yourself or someone you care about, our
            team is here to help.
          </p>
        </Reveal>
        <Reveal delay={90}>
          <Button href="#contact" variant="onGold" className="max-md:w-full">
            Talk to Our Team
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
