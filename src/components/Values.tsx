import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { pillars, sections } from '@/content/site';

export function Values() {
  return (
    <section aria-labelledby="values-title" className="section-y bg-linear-to-b from-blue-soft to-cream">
      <div className="shell">
        <Reveal className="mb-[clamp(2.5rem,4.5vw,4rem)] max-w-[62ch]">
          <h2 id="values-title">{sections.values.title}</h2>
        </Reveal>

        <div className="fold fold-wide grid gap-[clamp(1rem,2vw,1.5rem)] lg:grid-cols-3">
          {pillars.map((pillar, i) => {
            const [bg, text] = pillar.accent.split(' ');
            return (
              <Reveal
                as="article"
                key={pillar.label}
                kind="rise"
                delay={i * 90}
                className="group grid content-start gap-[0.9rem] rounded-card border border-line
                  bg-white p-[clamp(1.75rem,3vw,2.4rem)]
                  transition-[transform,box-shadow,border-color] duration-300
                  ease-(--ease-out-strong) hover:-translate-y-1 hover:border-line-strong
                  hover:shadow-card motion-reduce:hover:translate-y-0"
              >
                <Icon
                  name={pillar.icon}
                  className={`size-7 ${text} transition-transform duration-300
                    ease-(--ease-out-strong) group-hover:scale-110
                    motion-reduce:group-hover:scale-100`}
                />
                <h3 className="font-body text-[0.78125rem] font-bold uppercase tracking-[0.15em] text-muted">
                  <span
                    aria-hidden
                    className={`mb-3.5 block h-[3px] w-[30px] rounded-sm ${bg} origin-left
                      transition-transform duration-300 ease-(--ease-out-strong)
                      group-hover:scale-x-[1.6]`}
                  />
                  {pillar.label}
                </h3>
                <p className="font-display text-[clamp(1.0625rem,1rem+0.4vw,1.25rem)] font-medium
                  leading-[1.42] tracking-[-0.014em]">
                  {pillar.statement}
                </p>
                {pillar.values && (
                  <ul className="mt-0.5 flex flex-wrap gap-1.5">
                    {pillar.values.map((v) => (
                      // Derived from able[].word, so this is a mirror: edit
                      // the word in About and this follows on the next build.
                      <li
                        data-edit-skip
                        key={v}
                        className="rounded-full border border-line px-3 py-1 text-[0.8125rem]
                          font-semibold transition-colors duration-200 hover:border-gold hover:bg-gold/10"
                      >
                        {v}
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
