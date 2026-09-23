import React, { memo } from 'react';
import { View } from 'react-native';
import type { ActivityCategory } from '@domain/entities';
import { categoryTint } from '@presentation/theme';
import { Text } from './Text';

interface Props {
  category: ActivityCategory;
  minutes: number;
  /** thumb: 78×78 list thumbnail · grid: full-width 116pt card header. */
  variant: 'thumb' | 'grid';
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
          className={`font-sans-bold text-[27px] leading-[28px] tracking-[-0.8px] ${tint.fg}`}
        >
          {minutes}
        </Text>
        <Text className={`font-mono text-[9px] tracking-[1.2px] ${tint.fg}`}>
          MIN
        </Text>
      </View>
    );
  }
  return (
    <View className={`h-[116px] justify-end rounded-xl p-3 ${tint.bg}`}>
      <Text
        className={`font-sans-bold text-[38px] leading-[38px] tracking-[-1.5px] ${tint.fg}`}
      >
        {minutes}
        <Text className={`font-mono text-[11px] tracking-[1px] ${tint.fg}`}>
          {' '}
          MIN
        </Text>
      </Text>
    </View>
  );
});
