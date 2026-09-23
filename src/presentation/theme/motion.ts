import { FadeInDown } from 'react-native-reanimated';

/** Motion tokens (ms). Reanimated layout animations honor the OS "Reduce Motion" setting. */
export const duration = {
  fast: 150,
  base: 220,
  screen: 280,
} as const;

const STAGGER = 60;

/** Entrance for the `order`-th block of a screen: blocks fade up one after another. */
export const enter = (order: number) =>
  FadeInDown.duration(duration.base).delay(order * STAGGER);
