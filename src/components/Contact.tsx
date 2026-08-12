import Image from 'next/image';
import { ContactForm } from './ContactForm';
import { FacebookIcon, Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';
import { sections, site } from '@/content/site';

type Row = {
  icon: IconName | 'facebook';
  label: string;
  value: React.ReactNode;
  note?: string;
};

const rows: Row[] = [
  {
    icon: 'pin',
    label: 'Address',
    value: (
      <>
        {site.address.street}
        <br />
        {site.address.locality} {site.address.region} {site.address.postcode}
      </>
    ),
  },
  {
    icon: 'phone',
    label: 'Phone',
    value: (
      <a
        href={site.phone.href}
        className="border-b-[1.5px] border-line-strong transition-colors duration-200 hover:border-ink"
      >
        {site.phone.display}
      </a>
    ),
  },
  {
    icon: 'mail',
    label: 'Email',
    value: (
      <a
        href={`mailto:${site.email}`}
        className="border-b-[1.5px] border-line-strong transition-colors duration-200 hover:border-ink"
      >
        {site.email}
      </a>
    ),
  },
  {
    icon: 'facebook',
    label: 'Facebook',
    value: (
      <a
        href={site.facebook}
        rel="noopener"
        className="border-b-[1.5px] border-line-strong transition-colors duration-200 hover:border-ink"
      >
        facebook.com/werablecare
      </a>
    ),
    note: 'Follow along for updates from our team.',
  },
];

export function Contact() {
  return (
    <section id="contact" className="section-y bg-white">
      <div className="shell">
        <Reveal className="mb-[clamp(2.5rem,4.5vw,4rem)] grid max-w-[62ch] gap-[1.15rem]">
          <h2>{sections.contact.title}</h2>
          <p className="text-lead leading-[1.6] text-muted">
            {sections.contact.intro}
          </p>
        </Reveal>

        <div className="grid items-start gap-[clamp(2.25rem,4.5vw,4.5rem)] lg:grid-cols-[0.82fr_1fr]">
          <Reveal>
            <dl className="grid">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="group grid grid-cols-[44px_1fr] items-start gap-4 border-b border-line
                    py-[1.15rem] first:border-t"
                >
                  {row.icon === 'facebook' ? (
                    <FacebookIcon className="mt-0.5 size-[22px] text-blue transition-transform
                      duration-300 ease-(--ease-out-strong) group-hover:scale-110" />
                  ) : (
                    <Icon
                      name={row.icon}
                      className="mt-0.5 size-[22px] text-blue transition-transform duration-300
                        ease-(--ease-out-strong) group-hover:scale-110"
                    />
                  )}
                  <div>
                    <dt className="mb-1 text-[0.75rem] font-bold uppercase tracking-[0.13em] text-muted">
                      {row.label}
                    </dt>
                    <dd className="text-[1.0625rem] font-medium leading-[1.45]">
                      {row.value}
                      {row.note && (
                        <small className="mt-0.5 block text-[0.8125rem] font-normal text-muted">
                          {row.note}
                        </small>
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <figure className="group mt-[clamp(1.75rem,3vw,2.5rem)] overflow-hidden rounded-panel max-lg:hidden fold">
              <Image
                src="/assets/img/areas-outdoors-960.webp"
                alt="A support worker walking outdoors alongside a participant using a wheelchair."
                width={960}
                height={587}
                sizes="40vw"
                className="aspect-video w-full object-cover object-[50%_40%]
                  transition-transform duration-[600ms] ease-(--ease-out-strong)
                  group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
              />
            </figure>
          </Reveal>

          <Reveal kind="rise" delay={100}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
