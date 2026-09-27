import React, { memo, useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from './Icon';

interface Props {
  isFavorite: boolean;
  onPress: () => void;
  /** Already-translated accessibility label ("Add X to favorites"). */
  accessibilityLabel: string;
  /** icon: bare heart (rows) · overlay: 40pt disc on a card photo · circle: 54pt button (detail). */
  variant?: 'icon' | 'overlay' | 'circle';
  testID?: string;
}

/** Heart with the design's "pop" when it becomes a favorite. */
export const FavoriteButton = memo(
  ({
    isFavorite,
    onPress,
    accessibilityLabel,
    variant = 'icon',
    testID,
  }: Props) => {
    const scale = useSharedValue(1);
    const wasFavorite = useRef(isFavorite);
    useEffect(() => {
      if (isFavorite && !wasFavorite.current) {
        scale.value = withSequence(
          withTiming(1.5, { duration: 180 }),
          withTiming(1, { duration: 270 }),
        );
      }
      wasFavorite.current = isFavorite;
    }, [isFavorite, scale]);
    const pop = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const circle = variant === 'circle';
    const overlay = variant === 'overlay';
    return (
      <Pressable
        onPress={onPress}
        hitSlop={overlay ? 8 : 12}
        accessibilityRole="button"
        accessibilityState={{ selected: isFavorite }}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        className={
          circle
            ? `h-[54px] w-[54px] items-center justify-center rounded-full ${
                isFavorite
                  ? 'bg-primary'
                  : 'border border-border active:border-text'
              }`
            : overlay
            ? 'h-10 w-10 items-center justify-center rounded-full bg-raised shadow-sm active:opacity-80'
            : 'px-0.5 py-1'
        }
      >
        <Animated.View style={pop}>
          <Icon
            name="heart"
            filled={isFavorite}
            size={circle ? 25 : overlay ? 20 : 22}
            color={
              isFavorite
                ? circle
                  ? 'onPrimary'
                  : 'accent'
                : circle
                ? 'textMuted'
                : overlay
                ? 'text'
                : 'textFaint'
            }
          />
        </Animated.View>
      </Pressable>
    );
  },
);
