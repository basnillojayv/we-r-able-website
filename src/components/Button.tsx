import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type Variant = 'dark' | 'gold' | 'ghost' | 'ghostLight' | 'onGold';

const base =
  'inline-flex items-center justify-center gap-2.5 min-h-[52px] px-6 rounded-full border-[1.5px] ' +
  'text-[0.9688rem] font-semibold tracking-[-0.005em] cursor-pointer ' +
  'transition-[transform,background-color,border-color,color,box-shadow] duration-200 ' +
  'ease-(--ease-out-strong) active:scale-[0.97] active:duration-100 ' +
  'motion-reduce:active:scale-100';

/* Hover lift is opt-in per pointer type: Tailwind v4 already wraps `hover:`
   in @media (hover: hover), so touch devices never get a stuck hover state. */
const variants: Record<Variant, string> = {
  dark:
    'bg-ink text-white border-ink hover:bg-ink-mid hover:border-ink-mid ' +
    'hover:-translate-y-0.5 hover:shadow-card',
  gold:
    'bg-gold text-ink border-gold hover:bg-[#ffc730] hover:border-[#ffc730] ' +
    'hover:-translate-y-0.5 hover:shadow-card',
  ghost:
    'bg-transparent text-ink border-line-strong hover:border-ink ' +
    'hover:-translate-y-0.5 hover:shadow-card',
  ghostLight:
    'bg-transparent text-cream border-cream/40 hover:border-cream hover:bg-cream/10 ' +
    'hover:-translate-y-0.5',
  onGold:
    'bg-ink text-gold border-ink min-h-[58px] px-[1.9rem] hover:bg-ink-deep ' +
    'hover:border-ink-deep hover:-translate-y-0.5 hover:shadow-lift',
};

type Props<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  icon?: IconName;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export function Button<T extends ElementType = 'a'>({
  as,
  variant = 'dark',
  icon = 'arrowRight',
  className = '',
  children,
  ...rest
}: Props<T>) {
  const Tag = (as ?? 'a') as ElementType;
  const nudge =
    icon === 'arrowDown'
      ? 'group-hover:translate-y-[3px]'
      : 'group-hover:translate-x-[3px]';

  return (
    <Tag className={`group ${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      <Icon
        name={icon}
        className={`size-[17px] shrink-0 transition-transform duration-200 ease-(--ease-out-strong) ${nudge}`}
      />
    </Tag>
  );
}
