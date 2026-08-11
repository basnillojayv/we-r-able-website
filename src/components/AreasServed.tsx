import { Button } from './Button';
import { MelbourneMap } from './MelbourneMap';
import { Reveal } from './Reveal';
import { regions, site } from '@/content/site';

export function AreasServed() {
  return (
    <section id="areas" className="section-y bg-cream">
      <div className="shell">
        <Reveal className="mb-[clamp(2.5rem,4.5vw,4rem)] grid max-w-[62ch] gap-[1.15rem]">
          <h2>Proudly Supporting Metro Melbourne</h2>
          <p className="text-lead leading-[1.6] text-muted">
            WE R ABLE supports participants across a growing number of suburbs and localities
            throughout Melbourne.
          </p>
        </Reveal>

        <div className="grid items-start gap-[clamp(2.25rem,4.5vw,4.5rem)] lg:grid-cols-[1fr_0.92fr]">
          <Reveal>
            <ul className="grid gap-[clamp(0.85rem,1.8vw,1.25rem)] sm:grid-cols-2">
              {regions.map((region) => (
                <li
                  key={region.name}
                  className="group grid gap-1.5 rounded-card border border-line bg-white
                    px-[1.35rem] py-5 transition-[transform,box-shadow,border-color]
                    duration-300 ease-(--ease-out-strong) hover:-translate-y-1
                    hover:border-line-strong hover:shadow-card
                    motion-reduce:hover:translate-y-0"
                >
                  <span
                    aria-hidden
                    className={`mb-2 block h-[3px] w-[22px] rounded-sm ${region.rule} origin-left
                      transition-transform duration-300 ease-(--ease-out-strong)
                      group-hover:scale-x-[2]`}
                  />
                  <h3 className="text-[1.0625rem]">{region.name}</h3>
                  <p className="text-[0.8125rem] leading-[1.5] text-muted">{region.body}</p>
                  {region.suburbs && (
                    <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[0.8125rem] text-muted">
                      {region.suburbs.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-[clamp(1.25rem,2.4vw,1.75rem)] flex flex-wrap items-center gap-4 gap-x-5">
              <p className="flex-1 basis-70 text-small text-muted">
                Not sure whether we cover your suburb? Give us a call and we&rsquo;ll let you know
                straight away.
              </p>
              <Button href={site.phone.href} variant="ghost" icon="phone">
                Call {site.phone.display}
              </Button>
            </div>
          </Reveal>

          <Reveal
            as="figure"
            kind="rise"
            delay={120}
            className="overflow-hidden rounded-panel bg-ink-deep p-[clamp(1.5rem,3vw,2.25rem)]
              text-cream max-lg:order-first"
          >
            <MelbourneMap />
            <figcaption className="mt-[1.1rem] border-t border-line-dark pt-[1.1rem]
              text-[0.8125rem] leading-[1.55] text-muted-dark">
              <strong className="text-cream">Based in Caroline Springs, VIC 3023.</strong> Support
              is delivered where participants live, work and take part — across Metro Melbourne.
              Map is illustrative, not a service boundary.
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
