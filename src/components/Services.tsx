import { Button } from './Button';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { services } from '@/content/site';

export function Services() {
  return (
    <section id="services" className="section-y bg-white">
      <div className="shell">
        <Reveal className="mb-[clamp(2.5rem,4.5vw,4rem)] grid items-end gap-[clamp(1.15rem,3vw,3.5rem)] md:grid-cols-[1.05fr_0.95fr]">
          <h2>How We Can Support You</h2>
          <p className="max-w-[56ch] text-lead leading-[1.6] text-muted">
            Nine NDIS supports, designed around individual needs, goals and everyday life.
          </p>
        </Reveal>

        <ul className="grid gap-[clamp(0.85rem,1.6vw,1.25rem)] sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal
              as="li"
              key={service.title}
              delay={(i % 3) * 70}
              className="group relative grid content-start gap-[0.7rem] rounded-card border
                border-line bg-white p-[clamp(1.5rem,2.6vw,2rem)]
                transition-[transform,box-shadow,border-color] duration-300
                ease-(--ease-out-strong) hover:-translate-y-1 hover:border-ink
                hover:shadow-card motion-reduce:hover:translate-y-0"
            >
              <span
                className="grid size-[46px] place-items-center rounded-[14px] bg-blue-soft
                  text-blue transition-colors duration-300 ease-(--ease-out-strong)
                  group-hover:bg-ink group-hover:text-gold"
              >
                <Icon name={service.icon} className="size-[23px]" />
              </span>
              <h3 className="pr-6 text-[1.125rem]">{service.title}</h3>
              <p className="text-small leading-[1.58] text-muted">{service.body}</p>
              <Icon
                name="arrowNe"
                className="absolute right-[clamp(1.5rem,2.6vw,2rem)] top-[clamp(1.5rem,2.6vw,2rem)]
                  size-[18px] text-line-strong transition-[color,transform] duration-300
                  ease-(--ease-out-strong) group-hover:translate-x-[3px]
                  group-hover:-translate-y-[3px] group-hover:text-ink"
              />
            </Reveal>
          ))}
        </ul>

        <Reveal
          className="mt-[clamp(1.5rem,3vw,2.25rem)] flex flex-wrap items-center gap-4 gap-x-6
            rounded-card border border-line bg-cream px-[clamp(1.25rem,2.4vw,1.85rem)] py-[1.35rem]"
        >
          <p className="flex-1 basis-80 text-small text-muted">
            Not sure which supports fit your plan? Tell us about your goals and we&rsquo;ll talk you
            through the options.
          </p>
          <Button href="#contact" variant="ghost">
            Talk it through
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
