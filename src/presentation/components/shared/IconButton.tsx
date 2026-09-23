import React, { memo } from 'react';
import { Pressable } from 'react-native';
import {
  usePressHaptic,
  type PressHaptic,
} from '@presentation/hooks/usePressHaptic';
import { Icon, type IconName } from './Icon';

/** The design's 38pt round button (back chevron). */
export const IconButton = memo(
  ({
    icon,
    onPress,
    accessibilityLabel,
    testID,
    haptic = 'selection',
  }: {
    icon: IconName;
    onPress: () => void;
    accessibilityLabel: string;
    testID?: string;
    haptic?: PressHaptic;
  }) => {
    const handlePress = usePressHaptic(haptic, onPress);
    return (
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        className="h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-background active:bg-canvas"
      >
        <Icon name={icon} size={20} />
      </Pressable>
    );
  },
);
