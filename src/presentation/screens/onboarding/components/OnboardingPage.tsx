import React, { memo } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import {
  categoryColors,
  categoryImage,
  enter,
  useTheme,
} from '@presentation/theme';
import { PARALLAX, type Step } from '../constants';
import { onboardingStyles } from '../styles';
import { pageRange } from '../utils';
import { StepHeroCard } from './StepHeroCard';

interface Props {
  step: Step;
  n: number;
  width: number;
  scrollX: SharedValue<number>;
}

/** One onboarding step: photo hero card with a tinted panel, title and body. */
export const OnboardingPage = memo(({ step, n, width, scrollX }: Props) => {
  const t = useT();
  const { colors } = useTheme();
  const tint = categoryColors(colors)[step.tint];
  const parallax = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          pageRange(n - 1, width),
          [-width * PARALLAX, 0, width * PARALLAX],
          'clamp',
        ),
      },
    ],
  }));
  return (
    <View className="gap-[26px] p-5" style={{ width }}>
      <View
        className="h-[320px] overflow-hidden rounded-[20px]"
        style={{ backgroundColor: tint.bg }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.Image
          source={categoryImage(step.tint)}
          resizeMode="cover"
          style={[onboardingStyles.photo, parallax]}
        />
        <StepHeroCard step={step} n={n} tint={tint} />
      </View>
      <Animated.View entering={enter(1)} className="gap-3">
        <Text
          accessibilityRole="header"
          className="font-display-bold text-3xl leading-tight tracking-tight"
        >
          {t(step.title)}
        </Text>
        <Text className="text-lg text-text-muted">{t(step.body)}</Text>
      </Animated.View>
    </View>
  );
});
