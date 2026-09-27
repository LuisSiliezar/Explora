import React from 'react';
import { Pressable, View } from 'react-native';
import type { DurationFilter } from '@domain/entities';
import { Text } from '@presentation/components';
import { usePressHaptic } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { DURATIONS } from '../constants';

interface Props {
  duration: DurationFilter | null;
  onToggleDuration: (duration: DurationFilter) => void;
}

/** Segmented short / mid / long picker; tapping the selected one clears it. */
export const DurationSelector = ({ duration, onToggleDuration }: Props) => {
  const t = useT();
  const toggle = usePressHaptic('selection', onToggleDuration);
  return (
    <View className="flex-row gap-2">
      {DURATIONS.map(option => {
        const selected = duration === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => toggle(option.value)}
            accessibilityRole="button"
            accessibilityLabel={t(option.label)}
            accessibilityState={{ selected }}
            className={`flex-1 items-center rounded-[10px] border border-border py-2.5 ${
              selected ? 'bg-inverse' : 'bg-raised'
            }`}
          >
            <Text
              className={`font-sans-semibold text-sm ${
                selected ? 'text-on-inverse' : 'text-text'
              }`}
            >
              {t(option.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
