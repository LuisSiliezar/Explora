import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const ROWS = [0, 1, 2, 3];

/** Loading placeholder shaped like the list rows, with the design's shimmer. */
export const ActivitySkeleton = () => {
  const opacity = useSharedValue(0.45);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 750 }), -1, true);
  }, [opacity]);
  const shimmer = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View
      className="gap-[18px] px-5 pt-1"
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {ROWS.map(row => (
        <Animated.View
          key={row}
          style={shimmer}
          className="flex-row gap-[13px]"
        >
          <View className="h-[78px] w-[78px] rounded-xl bg-skeleton" />
          <View className="flex-1 gap-2 pt-1">
            <View className="h-3.5 w-16 rounded-[5px] bg-skeleton" />
            <View className="h-4 w-[82%] rounded-[5px] bg-skeleton" />
            <View className="h-[13px] w-[54%] rounded-[5px] bg-skeleton" />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};
