import React, { memo } from 'react';
import { View } from 'react-native';
import { Text } from './Text';

/** Small mono tag: category (green) or neutral (distance). */
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
        className={`font-mono text-[10px] tracking-[0.8px] ${
          tone === 'category' ? 'text-accent' : 'text-text'
        }`}
      >
        {label}
      </Text>
    </View>
  ),
);
