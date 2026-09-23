import React, { memo } from 'react';
import { View } from 'react-native';
import { Text } from './Text';

/** Small uppercase tag: category (green) or neutral (distance). */
export const Pill = memo(
  ({
    label,
    tone = 'category',
  }: {
    label: string;
    tone?: 'category' | 'neutral';
  }) => (
    <View
      className={`self-start rounded-[5px] px-[7px] py-[3px] ${
        tone === 'category' ? 'bg-success' : 'bg-tag-surface'
      }`}
    >
      <Text
        className={`font-sans-medium text-xs tracking-widest ${
          tone === 'category' ? 'text-accent' : 'text-text'
        }`}
      >
        {label}
      </Text>
    </View>
  ),
);
