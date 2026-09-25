import React from 'react';
import { StyleSheet, Text as RNText, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';
import { useSettings } from '@presentation/hooks/useSettings';
import { useTheme } from '@presentation/theme';

/** Same as `text-base` (NativeWind resolves 1rem to 14px on native). */
const BASE_FONT_SIZE = 14;

/**
 * App-wide Text: DM Sans + theme text color by default, and the in-app text size
 * (Settings → Text size) applied on top of whatever the className resolves to.
 */
/** Upper bound for the OS font scale on top of the in-app text size (also for TextInputs). */
export const MAX_FONT_SCALE = 2;

export const Text = ({ style, ...rest }: TextProps) => {
  const scale = useSettings(state => state.textScale);
  const { colors, fonts } = useTheme();
  const flat =
    StyleSheet.flatten([
      {
        fontFamily: fonts.regular,
        color: colors.text,
        fontSize: BASE_FONT_SIZE,
      },
      style,
    ]) ?? {};
  const scaled =
    scale === 1
      ? flat
      : {
          ...flat,
          fontSize: (flat.fontSize ?? BASE_FONT_SIZE) * scale,
          lineHeight: flat.lineHeight ? flat.lineHeight * scale : undefined,
        };
  // Honor the OS text size up to 2x (the largest accessibility sizes); a caller may lower it
  // for fixed-size chrome such as badges. See docs/decisions/007-large-text.md.
  return (
    <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} {...rest} style={scaled} />
  );
};

cssInterop(Text, { className: 'style' });
