import React, { memo } from 'react';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@presentation/theme';
import { pageRange } from '../utils';

interface Props {
  i: number;
  width: number;
  scrollX: SharedValue<number>;
}

/** Pager dot: stretches and turns from translucent white to green as its page scrolls into place. */
export const PagerDot = memo(({ i, width, scrollX }: Props) => {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => {
    const range = pageRange(i, width);
    return {
      width: interpolate(scrollX.value, range, [7, 22, 7], 'clamp'),
      opacity: interpolate(scrollX.value, range, [0.5, 1, 0.5], 'clamp'),
      backgroundColor: interpolateColor(scrollX.value, range, [
        colors.onPhoto,
        colors.primary,
        colors.onPhoto,
      ]),
    };
  });
  return <Animated.View className="h-[7px] rounded-full" style={style} />;
});
