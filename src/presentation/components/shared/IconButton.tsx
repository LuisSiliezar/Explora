import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { Icon, type IconName } from './Icon';

/** The design's 38pt round button (back chevron). */
export const IconButton = memo(
  ({
    icon,
    onPress,
    accessibilityLabel,
  }: {
    icon: IconName;
    onPress: () => void;
    accessibilityLabel: string;
  }) => (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-background active:bg-canvas"
    >
      <Icon name={icon} size={20} />
    </Pressable>
  ),
);
