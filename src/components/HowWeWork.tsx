import Image from 'next/image';
import { Reveal } from './Reveal';
import { sections, steps } from '@/content/site';

/*
  The one numbered sequence on the page. The numbers are not scaffolding —
  they are the order the support relationship actually runs in, and the wipe
  reveal uncovers them left to right so the motion carries that order too.
*/
export function HowWeWork() {
  return (
    <section aria-labelledby="how-title" className="section-y on-dark bg-ink-deep text-cream">
      <div className="shell">
        <Reveal className="mb-[clamp(2.5rem,4.5vw,4rem)] grid items-center gap-[clamp(1.75rem,4vw,4rem)] lg:grid-cols-[1fr_0.7fr]">
          <div className="grid gap-[1.15rem]">
            <h2 id="how-title" className="text-cream">
              {sections.how.title} <em className="not-italic text-gold">{sections.how.titleAccent}</em>
            </h2>
            <p className="max-w-[56ch] text-lead leading-[1.6] text-muted-dark">
              {sections.how.intro}
            </p>
          </div>
          <figure className="group overflow-hidden rounded-panel">
            <Image
              src="/assets/img/why-wheel-960.webp"
              alt="Close-up of a person's hand resting on the push rim of their wheelchair."
              width={960}
              height={1067}
              sizes="(max-width: 1024px) 100vw, 34vw"
              className="parallax aspect-video w-full object-cover object-[55%_45%]
                transition-transform duration-[600ms] ease-(--ease-out-strong)
                group-hover:scale-[1.15] motion-reduce:group-hover:scale-100"
            />
          </figure>
        </Reveal>

        <ol className="grid border-t border-line-dark md:grid-cols-2">
          {steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.n}
              kind="wipe"
              delay={i * 110}
              className={`group grid grid-cols-[auto_1fr] gap-[clamp(1.25rem,2.4vw,2rem)]
                border-b border-line-dark py-[clamp(1.75rem,3.2vw,2.75rem)]
                ${
                  i % 2 === 0
                    ? 'md:border-r md:pr-[clamp(1.5rem,4vw,4rem)]'
                    : 'md:pl-[clamp(1.5rem,4vw,4rem)]'
                }`}
            >
              {/* Outlined until you attend to it, then it fills — the hover
                  answers the number rather than decorating it. */}
              <span
                aria-hidden
                style={{ '--ink': step.ink } as React.CSSProperties}
                className="font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.6rem)] font-extrabold
                  leading-none tracking-[-0.04em] text-transparent
                  [-webkit-text-stroke:1.4px_var(--ink)]
                  transition-[color] duration-300 ease-(--ease-out-strong)
                  group-hover:text-(--ink)"
              >
                {step.n}
              </span>
              <div>
                <h3 className="mb-2 text-[clamp(1.15rem,1rem+0.6vw,1.5rem)] text-cream">
                  <span
                    aria-hidden
                    className={`mb-3.5 block h-[3px] w-[34px] rounded-sm ${step.rule} origin-left
                      transition-transform duration-300 ease-(--ease-out-strong)
                      group-hover:scale-x-[1.8]`}
                  />
                  {step.title}
                </h3>
                <p className="max-w-[42ch] text-small leading-[1.62] text-muted-dark">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
