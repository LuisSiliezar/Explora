import React from 'react';
import { Pressable } from 'react-native';
import { Icon, Text } from '@presentation/components';
import { useDependencies, useSettings } from '@presentation/hooks';

/** Pill that flips EN ⇄ ES. */
export const LanguagePill = () => {
  const { settingsStore, haptics } = useDependencies();
  const language = useSettings(state => state.language);
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        settingsStore.getState().setLanguage(language === 'en' ? 'es' : 'en');
      }}
      accessibilityRole="button"
      accessibilityLabel={
        language === 'en' ? 'Language: English' : 'Idioma: Español'
      }
      className="flex-row items-center gap-1.5 rounded-full border border-border px-3 py-[7px] active:border-text"
    >
      <Text className="font-sans-semibold text-sm">
        {language.toUpperCase()}
      </Text>
      <Icon name="chevronDown" size={14} />
    </Pressable>
  );
};
