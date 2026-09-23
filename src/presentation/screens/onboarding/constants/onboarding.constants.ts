import type { IconName } from '@presentation/components';
import type { StringKey } from '@presentation/i18n';

export interface Step {
  title: StringKey;
  body: StringKey;
  note: StringKey;
  /** Big number or icon at the top of the step card. */
  hero: { text: string } | { icon: IconName };
  tint: 'Outdoors' | 'Culture' | 'Leisure';
}

export const STEPS: Step[] = [
  {
    title: 'ob1Title',
    body: 'ob1Body',
    note: 'ob1Note',
    hero: { text: '12' },
    tint: 'Outdoors',
  },
  {
    title: 'ob2Title',
    body: 'ob2Body',
    note: 'ob2Note',
    hero: { icon: 'heart' },
    tint: 'Culture',
  },
  {
    title: 'ob3Title',
    body: 'ob3Body',
    note: 'ob3Note',
    hero: { icon: 'location' },
    tint: 'Leisure',
  },
];

/** Decorative progress bars at the bottom of the step card. */
export const BARS = [
  { width: '64%', opacity: 0.9 },
  { width: '40%', opacity: 0.55 },
  { width: '22%', opacity: 0.3 },
] as const;

/** How far the hero photo drifts (fraction of the page width) while swiping. */
export const PARALLAX = 0.3;
