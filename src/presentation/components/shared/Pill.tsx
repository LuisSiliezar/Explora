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
      className={`self-start rounded-full px-3 py-1 ${
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
