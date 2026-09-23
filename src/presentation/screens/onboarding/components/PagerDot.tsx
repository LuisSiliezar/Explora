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

/** Pager dot: stretches and turns green as its page scrolls into place. */
export const PagerDot = memo(({ i, width, scrollX }: Props) => {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => {
    const range = pageRange(i, width);
    return {
      width: interpolate(scrollX.value, range, [7, 22, 7], 'clamp'),
      backgroundColor: interpolateColor(scrollX.value, range, [
        colors.border,
        colors.primary,
        colors.border,
      ]),
    };
  });
  return <Animated.View className="h-[7px] rounded-full" style={style} />;
});
