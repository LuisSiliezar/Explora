import type { ActivityCategory } from '@domain/entities';
import palette from './palette';

export type Colors = typeof palette.light;
export const palettes: { light: Colors; dark: Colors } = palette;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
export const radius = { sm: 9, md: 12, lg: 14, xl: 18, pill: 999 } as const;

/** Category tints as literal class names (Tailwind only generates classes it can see in source). */
export const categoryTint: Record<
  ActivityCategory,
  { bg: string; fg: string }
> = {
  Outdoors: { bg: 'bg-outdoors-bg', fg: 'text-outdoors-fg' },
  Culture: { bg: 'bg-culture-bg', fg: 'text-culture-fg' },
  Workshops: { bg: 'bg-workshops-bg', fg: 'text-workshops-fg' },
  Leisure: { bg: 'bg-leisure-bg', fg: 'text-leisure-fg' },
};

/** The same tints as raw colors, for places that can't take a class (e.g. dynamic step cards). */
export const categoryColors = (
  colors: Colors,
): Record<ActivityCategory, { bg: string; fg: string }> => ({
  Outdoors: { bg: colors.outdoorsBg, fg: colors.outdoorsFg },
  Culture: { bg: colors.cultureBg, fg: colors.cultureFg },
  Workshops: { bg: colors.workshopsBg, fg: colors.workshopsFg },
  Leisure: { bg: colors.leisureBg, fg: colors.leisureFg },
});

export const fonts = {
  regular: 'Figtree-Regular',
  medium: 'Figtree-Medium',
  semibold: 'Figtree-SemiBold',
  bold: 'Figtree-Bold',
  mono: 'IBMPlexMono-Regular',
  monoMedium: 'IBMPlexMono-Medium',
} as const;
