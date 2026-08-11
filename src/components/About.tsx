import Image from 'next/image';
import { Reveal } from './Reveal';
import { able } from '@/content/site';

export function About() {
  return (
    <section id="about" className="section-y bg-white">
      <div className="shell grid items-start gap-[clamp(2.5rem,5vw,5rem)] lg:grid-cols-[1fr_0.86fr]">
        <Reveal className="grid gap-6">
          <h2 className="max-w-[15ch]">Everyone has the ability to live a fulfilling life.</h2>
          <p className="max-w-[56ch] text-lead leading-[1.6] text-muted">
            WE R ABLE is a registered NDIS disability support provider committed to putting
            participants first. We provide personalised support that promotes independence,
            inclusion and choice, helping people with disability participate more fully in their
            communities and everyday lives.
          </p>
          <figure className="group mt-3 overflow-hidden rounded-panel">
            <Image
              src="/assets/img/about-home-960.webp"
              alt="A man using a wheelchair working at his laptop at home with a cup of tea, his support worker beside him."
              width={960}
              height={1199}
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="aspect-16/10 w-full object-cover object-[50%_35%]
                transition-transform duration-[600ms] ease-(--ease-out-strong)
                group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
            />
          </figure>
        </Reveal>

        <Reveal
          kind="rise"
          delay={120}
          className="overflow-hidden rounded-panel border border-line bg-cream"
        >
          <div className="grid gap-1.5 border-b border-line p-[clamp(1.25rem,2.4vw,1.85rem)]">
            <h3>The idea behind our name</h3>
            <p className="text-small text-muted">
              Four words shape how our team shows up every day.
            </p>
          </div>
          <ul>
            {able.map((row) => (
              <li
                key={row.letter}
                className="group grid grid-cols-[58px_1fr] items-center gap-4 border-b border-line
                  p-[clamp(1.05rem,2vw,1.35rem)] px-[clamp(1.25rem,2.4vw,1.85rem)] last:border-b-0
                  transition-colors duration-300 ease-(--ease-out-strong) hover:bg-white
                  sm:grid-cols-[74px_1fr] sm:gap-[1.1rem]"
              >
                <span
                  aria-hidden
                  className={`grid size-[58px] place-items-center rounded-card font-display
                    text-[1.7rem] font-extrabold leading-none tracking-[-0.03em] ${row.chip}
                    transition-transform duration-300 ease-(--ease-out-strong)
                    group-hover:-rotate-3 group-hover:scale-105
                    motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100
                    sm:size-[74px] sm:text-[2.15rem]`}
                >
                  {row.letter}
                </span>
                <div>
                  <h4 className="text-[1.125rem]">{row.word}</h4>
                  <p className="text-small leading-[1.55] text-muted">{row.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
