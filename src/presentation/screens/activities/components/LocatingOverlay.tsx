import React from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { useTheme } from '@presentation/theme';

/** Full-screen scrim with a spinner while the first location fix comes in. */
export const LocatingOverlay = () => {
  const t = useT();
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      className="absolute inset-0 items-center justify-center gap-3.5 bg-background/90"
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={colors.accent} />
      <Text className="font-sans-semibold text-lg">{t('locating')}</Text>
    </Animated.View>
  );
};
