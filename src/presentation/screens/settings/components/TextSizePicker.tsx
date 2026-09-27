import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@presentation/components';
import { useDependencies, useSettings } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { TEXT_SIZES } from '../constants';

/** S / M / L radio buttons for the in-app text scale. */
export const TextSizePicker = () => {
  const t = useT();
  const { settingsStore, haptics } = useDependencies();
  const textScale = useSettings(state => state.textScale);
  return (
    <>
      <View className="flex-row gap-2">
        {TEXT_SIZES.map(option => {
          const selected = textScale === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                haptics.selection();
                settingsStore.getState().setTextScale(option.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={t('textSizeOption', { s: option.label })}
              accessibilityState={{ checked: selected }}
              className={`flex-1 items-center rounded-[10px] border border-border py-3 ${
                selected ? 'bg-primary' : 'bg-background'
              }`}
            >
              <Text
                className={`font-sans-semibold ${option.sizeClass} ${
                  selected ? 'text-on-primary' : 'text-text'
                }`}
              >
                A
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="text-sm text-text-muted">{t('textSizeNote')}</Text>
    </>
  );
};
