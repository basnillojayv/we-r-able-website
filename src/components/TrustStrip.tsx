import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { sections, trust } from '@/content/site';

export function TrustStrip() {
  return (
    <section aria-labelledby="trust-title" className="relative z-20 -mt-11 max-md:mt-6">
      <h2 id="trust-title" className="sr-only">
        {sections.trust.title}
      </h2>
      <div className="shell">
        <ul
          className="fold grid overflow-hidden rounded-panel border border-line bg-white
            shadow-card sm:grid-cols-2 lg:grid-cols-4"
        >
          {trust.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={i * 60}
              className={`group grid gap-2 p-[clamp(1.5rem,2.4vw,2rem)]
                transition-colors duration-300 ease-(--ease-out-strong) hover:bg-cream
                border-line max-sm:not-last:border-b
                sm:max-lg:nth-[-n+2]:border-b sm:max-lg:odd:border-r
                lg:not-last:border-r`}
            >
              <Icon
                name={item.icon}
                className={`size-[26px] ${item.tone} transition-transform duration-300
                  ease-(--ease-out-strong) group-hover:-translate-y-0.5 group-hover:scale-110`}
              />
              <h3 className="mt-1.5 text-[1.0625rem]">{item.title}</h3>
              <p className="text-small leading-[1.55] text-muted">{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
