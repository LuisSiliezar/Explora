import React from 'react';
import { View } from 'react-native';
import { fonts, type Colors } from '@presentation/theme';

/** The design's toast marker: a small dot tinted by the toast's variant. */
export const toastIcons = {
  info: <View className="h-2 w-2 rounded-full bg-text-faint" />,
  success: <View className="h-2 w-2 rounded-full bg-primary" />,
  warning: <View className="h-2 w-2 rounded-full bg-warning" />,
  error: <View className="h-2 w-2 rounded-full bg-danger" />,
};

/** Same as `text-base`: sonner styles can't take a className. */
const TOAST_FONT_SIZE = 14;

/**
 * The design's toast: themed pill (dark in light mode, raised in dark mode), green action.
 * `textScale` is the in-app text size, so toasts match the rest of the app's `Text`.
 */
export const toasterOptions = (colors: Colors, textScale: number) => ({
  style: {
    backgroundColor: colors.toast,
    borderColor: colors.toastBorder,
    borderRadius: 12,
    borderWidth: 1,
  },
  toastContentStyle: { alignItems: 'center' as const },
  textContainerStyle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  titleStyle: {
    flex: 1,
    color: colors.onToast,
    fontFamily: fonts.semibold,
    fontSize: TOAST_FONT_SIZE * textScale,
  },
  buttonsStyle: { marginTop: 0, paddingTop: 0 },
  actionButtonStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    height: undefined,
  },
  actionButtonTextStyle: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: TOAST_FONT_SIZE * textScale,
  },
});
