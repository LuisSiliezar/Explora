import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import {
  usePressHaptic,
  type PressHaptic,
} from '@presentation/hooks/usePressHaptic';

interface Props {
  value: boolean;
  onValueChange: (next: boolean) => void;
  accessibilityLabel: string;
  haptic?: PressHaptic;
}

export const Toggle = memo(
  ({
    value,
    onValueChange,
    accessibilityLabel,
    haptic = 'selection',
  }: Props) => {
    const handlePress = usePressHaptic(haptic, () => onValueChange(!value));
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked: value }}
        hitSlop={8}
        className={`h-7 w-[46px] flex-row items-center rounded-full p-[3px] ${
          value ? 'justify-end bg-primary' : 'justify-start bg-border'
        }`}
      >
        <View className="h-[22px] w-[22px] rounded-full bg-white" />
      </Pressable>
    );
  },
);
