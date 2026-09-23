import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import type { Colors } from '@presentation/theme';

/** React Navigation theme built from the app palette. */
export const navigationTheme = (
  dark: boolean,
  colors: Colors,
): NavigationTheme => {
  const base = dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };
};
