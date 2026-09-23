import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Leading status dot (the "Near me" chip). */
  dot?: 'on' | 'off' | 'disabled';
  size?: 'md' | 'sm';
}

const dotClass = {
  on: 'bg-primary',
  off: 'bg-text-faint',
  disabled: 'bg-border',
} as const;

export const Chip = memo(
  ({ label, selected, onPress, dot, size = 'md' }: Props) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-[7px] rounded-full border border-border py-2 ${
        size === 'md' ? 'px-[15px]' : 'px-3.5'
      } ${selected ? 'bg-inverse' : 'bg-background active:border-text'}`}
    >
      {dot && (
        <View className={`h-[7px] w-[7px] rounded-full ${dotClass[dot]}`} />
      )}
      <Text
        className={`font-sans-semibold text-[13px] ${
          selected
            ? 'text-on-inverse'
            : dot === 'disabled'
            ? 'text-text-muted'
            : 'text-text'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  ),
);
