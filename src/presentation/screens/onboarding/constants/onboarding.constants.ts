import type { StringKey } from '@presentation/i18n';

export interface Step {
  title: StringKey;
  body: StringKey;
  /** Category whose photo fills the page. */
  tint: 'Outdoors' | 'Culture' | 'Leisure';
}

export const STEPS: Step[] = [
  { title: 'ob1Title', body: 'ob1Body', tint: 'Outdoors' },
  { title: 'ob2Title', body: 'ob2Body', tint: 'Culture' },
  { title: 'ob3Title', body: 'ob3Body', tint: 'Leisure' },
];

/** How far the background photo drifts (fraction of the page width) while swiping. */
export const PARALLAX = 0.3;
