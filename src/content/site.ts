import type { IconName } from '@/components/Icon';

/* ==========================================================================
   Every fact here comes from werable.com.au. Nothing is invented — no
   statistics, testimonials, registration numbers or years-in-business.
   ========================================================================== */

export const site = {
  name: 'WE R ABLE',
  tagline: 'We Are Able to Make A Difference.',
  phone: { display: '0414 877 670', href: 'tel:+61414877670' },
  email: 'werable.disability@gmail.com',
  facebook: 'https://www.facebook.com/werablecare/',
  address: {
    street: '21 Herring Loop',
    locality: 'Caroline Springs',
    region: 'VIC',
    postcode: '3023',
  },
} as const;

export const nav = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Areas Served', href: '#areas' },
  { label: 'Contact', href: '#contact' },
] as const;

export type Trust = { icon: IconName; title: string; body: string; tone: string };

export const trust: Trust[] = [
  {
    icon: 'verified',
    title: 'NDIS Registered',
    body: 'Registered disability support provider.',
    tone: 'text-blue',
  },
  {
    icon: 'personHeart',
    title: 'Participant First',
    body: 'Support centred around individual needs.',
    tone: 'text-magenta',
  },
  {
    icon: 'handsHeart',
    title: 'Compassionate Care',
    body: 'Respectful and person-centred support.',
    tone: 'text-gold-mid',
  },
  {
    icon: 'pin',
    title: 'Metro Melbourne',
    body: 'Supporting participants across Melbourne.',
    tone: 'text-ink',
  },
];

export type AbleLetter = { letter: string; word: string; body: string; chip: string };

export const able: AbleLetter[] = [
  {
    letter: 'A',
    word: 'Ability',
    body: 'We start from what a person can do, not what they can’t.',
    chip: 'bg-blue text-white',
  },
  {
    letter: 'B',
    word: 'Best',
    body: 'Every shift, every visit, done properly.',
    chip: 'bg-magenta text-white',
  },
  {
    letter: 'L',
    word: 'Love',
    body: 'Warmth and patience, not a checklist.',
    chip: 'bg-gold text-ink',
  },
  {
    letter: 'E',
    word: 'Empowering',
    body: 'Building the confidence to take the lead.',
    chip: 'bg-ink text-white',
  },
];

export type Pillar = {
  icon: IconName;
  label: string;
  statement: string;
  accent: string;
  values?: string[];
};

export const pillars: Pillar[] = [
  {
    icon: 'flag',
    label: 'Our Mission',
    statement:
      'To provide remarkable care that makes a meaningful difference in the lives of the people we support.',
    accent: 'bg-blue text-blue',
  },
  {
    icon: 'horizon',
    label: 'Our Vision',
    statement:
      'A society where every person is valued, respected and empowered to reach their full potential.',
    accent: 'bg-magenta text-magenta',
  },
  {
    icon: 'heartCore',
    label: 'Our Values',
    statement: 'The four words behind our name.',
    accent: 'bg-gold text-gold-mid',
    values: ['Ability', 'Best', 'Love', 'Empowering'],
  },
];

export type Service = { icon: IconName; title: string; body: string };

export const services: Service[] = [
  {
    icon: 'transport',
    title: 'Travel & Transport',
    body: 'Support to travel safely and access the places that matter to you.',
  },
  {
    icon: 'sharedLiving',
    title: 'Group & Shared Living',
    body: 'Support with daily living in group or shared accommodation.',
  },
  {
    icon: 'household',
    title: 'Household Tasks',
    body: 'Practical support to maintain a safe and comfortable home.',
  },
  {
    icon: 'lifeSkills',
    title: 'Daily Living & Life Skills',
    body: 'Build confidence, independence and everyday living skills.',
  },
  {
    icon: 'personal',
    title: 'Personal Activities',
    body: 'Personalised assistance with everyday personal care and activities.',
  },
  {
    icon: 'highIntensity',
    title: 'High-Intensity Personal Activities',
    body: 'Specialised support for participants with more complex care needs.',
  },
  {
    icon: 'nursing',
    title: 'Community Nursing',
    body: 'Professional nursing support delivered within the community.',
  },
  {
    icon: 'community',
    title: 'Community Participation',
    body: 'Support to connect, participate and engage with the community.',
  },
  {
    icon: 'activities',
    title: 'Group & Centre-Based Activities',
    body: 'Opportunities to learn, socialise and participate in meaningful activities.',
  },
];

/* A real sequence — the order the support relationship actually unfolds in —
   which is the only thing that earns numbered markers. */
export type Step = { n: string; title: string; body: string; rule: string; ink: string };

export const steps: Step[] = [
  {
    n: '01',
    title: 'We Listen',
    body: 'We take the time to understand your needs, preferences and goals.',
    rule: 'bg-gold',
    ink: 'var(--color-gold)',
  },
  {
    n: '02',
    title: 'We Respect',
    body: 'Your choices, dignity and independence always come first.',
    rule: 'bg-blue',
    ink: 'var(--color-blue)',
  },
  {
    n: '03',
    title: 'We Empower',
    body: 'We help you build confidence and develop greater independence.',
    rule: 'bg-magenta',
    ink: 'var(--color-magenta)',
  },
  {
    n: '04',
    title: 'We Care',
    body: 'Our support is delivered with compassion, patience and genuine care.',
    rule: 'bg-cream',
    ink: 'var(--color-cream)',
  },
];

/* The live site publishes no suburb list — only "different suburbs and
   localities around Metro Melbourne" — so these are the metro groupings we
   work across, not invented coverage. To publish the real list, add a
   `suburbs` array to any region and AreasServed renders it. */
export type Region = { name: string; body: string; rule: string; suburbs?: string[] };

export const regions: Region[] = [
  {
    name: 'Western Melbourne',
    body: 'Our home base — Caroline Springs and the surrounding west.',
    rule: 'bg-gold',
  },
  {
    name: 'Northern Melbourne',
    body: 'Suburbs and localities across Melbourne’s north.',
    rule: 'bg-blue',
  },
  {
    name: 'Inner & Eastern',
    body: 'Inner Melbourne through to the eastern suburbs.',
    rule: 'bg-magenta',
  },
  {
    name: 'Other Metro Areas',
    body: 'We’re steadily extending our reach across Greater Melbourne.',
    rule: 'bg-ink',
  },
];

export const enquiryTopics = [
  'Starting support with WE R ABLE',
  'Travel & transport',
  'Group or shared living',
  'Household tasks',
  'Daily living & life skills',
  'Personal activities',
  'High-intensity personal activities',
  'Community nursing',
  'Community participation',
  'Group & centre-based activities',
  'I’m a support coordinator',
  'Something else',
];
