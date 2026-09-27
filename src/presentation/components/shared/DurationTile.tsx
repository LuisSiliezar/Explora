import React, { memo } from 'react';
import { View } from 'react-native';
import type { ActivityCategory } from '@domain/entities';
import { categoryTint } from '@presentation/theme';
import { Text } from './Text';

interface Props {
  category: ActivityCategory;
  minutes: number;
  /** thumb: 78×78 row thumbnail · card: the carousel card's full-width 260pt photo. */
  variant: 'thumb' | 'card';
}

/** The no-photo card artwork: the duration set large on the category tint. */
export const DurationTile = memo(({ category, minutes, variant }: Props) => {
  const tint = categoryTint[category];
  if (variant === 'thumb') {
    return (
      <View
        className={`h-[78px] w-[78px] items-center justify-center rounded-xl ${tint.bg}`}
      >
        <Text
          className={`font-display-bold text-3xl leading-none tracking-tight ${tint.fg}`}
        >
          {minutes}
        </Text>
        <Text className={`font-sans-medium text-xs tracking-widest ${tint.fg}`}>
          MIN
        </Text>
      </View>
    );
  }
  return (
    <View className={`h-[260px] justify-end rounded-2xl p-3.5 ${tint.bg}`}>
      <Text
        className={`font-display-bold text-5xl leading-none tracking-tighter ${tint.fg}`}
      >
        {minutes}
        <Text className={`font-sans-medium text-xs tracking-widest ${tint.fg}`}>
          {' '}
          MIN
        </Text>
      </Text>
    </View>
  );
});
