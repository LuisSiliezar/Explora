import { useColorScheme } from 'react-native';
import { fonts, palettes, radius, spacing } from './tokens';

/** For values that can't be NativeWind classes (navigation theme, placeholder colors, Lottie...). */
export const useTheme = () => {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return {
    scheme,
    colors: palettes[scheme],
    spacing,
    radius,
    fonts,
  } as const;
};

/** @public */
export type Theme = ReturnType<typeof useTheme>;
