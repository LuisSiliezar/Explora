import React, { memo } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { categoryImage, enter } from '@presentation/theme';
import { PARALLAX, type Step } from '../constants';
import { onboardingStyles } from '../styles';
import { pageRange } from '../utils';

interface Props {
  step: Step;
  n: number;
  width: number;
  /** Height of the dots + button footer the text has to clear. */
  bottomInset: number;
  scrollX: SharedValue<number>;
}

/** One onboarding step: full-screen photo with the step badge, title and body over it. */
export const OnboardingPage = memo(
  ({ step, n, width, bottomInset, scrollX }: Props) => {
    const t = useT();
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
      <View className="overflow-hidden" style={{ width }}>
        <View
          className="absolute inset-0"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Animated.Image
            source={categoryImage(step.tint)}
            resizeMode="cover"
            style={[onboardingStyles.photo, parallax]}
          />
          <View style={onboardingStyles.scrim} />
        </View>
        <Animated.View
          entering={enter(1)}
          className="flex-1 justify-end gap-3 px-5"
          style={{ paddingBottom: bottomInset + 24 }}
        >
          <View className="self-start rounded-full border border-on-photo/40 px-2.5 py-1">
            <Text className="font-sans-semibold text-xs tracking-widest text-on-photo">
              {t('stepOf', { n })}
            </Text>
          </View>
          <Text
            accessibilityRole="header"
            className="font-display-bold text-4xl leading-tight tracking-tight text-on-photo"
          >
            {t(step.title)}
          </Text>
          <Text className="text-lg text-on-photo/80">{t(step.body)}</Text>
        </Animated.View>
      </View>
    );
  },
);
