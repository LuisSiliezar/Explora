import React from 'react';
import { View } from 'react-native';
import { fonts, type Colors } from '@presentation/theme';

/** The design's toast marker: a small green dot instead of sonner's variant icons. */
const toastDot = <View className="h-2 w-2 rounded-full bg-primary" />;
export const toastIcons = {
  info: toastDot,
  success: toastDot,
  warning: toastDot,
  error: toastDot,
};

/** The design's toast: dark pill, green action, title and Undo on one line. */
export const toasterOptions = (colors: Colors) => ({
  style: {
    backgroundColor: colors.inverse,
    borderRadius: 12,
    borderWidth: 0,
  },
  toastContentStyle: { alignItems: 'center' as const },
  textContainerStyle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  titleStyle: {
    flex: 1,
    color: colors.onInverse,
    fontFamily: fonts.semibold,
    fontSize: 14, // = text-base; sonner styles can't take a className
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
    fontSize: 14, // = text-base; sonner styles can't take a className
  },
});
