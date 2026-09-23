import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon, Text } from '@presentation/components';
import { useDependencies, useSettings, useToast } from '@presentation/hooks';
import { LANGUAGES, translate, useT } from '@presentation/i18n';

/** The language radio list on the Language sub-screen. */
export const LanguageOptions = () => {
  const t = useT();
  const toast = useToast();
  const { settingsStore, haptics } = useDependencies();
  const language = useSettings(state => state.language);

  return (
    <View className="gap-4">
      <View>
        {LANGUAGES.map(option => {
          const active = option.code === language;
          return (
            <Pressable
              key={option.code}
              onPress={() => {
                if (active) {
                  return;
                }
                haptics.selection();
                settingsStore.getState().setLanguage(option.code);
                toast.show(translate(option.code, 'toastLang'));
              }}
              accessibilityRole="radio"
              accessibilityLabel={option.name}
              accessibilityState={{ checked: active }}
              testID={`language-${option.code}`}
              className="flex-row items-center gap-3 border-b border-border py-5"
            >
              <Text className="flex-1 font-display-semibold text-xl">
                {option.name}
              </Text>
              {active && <Icon name="check" size={22} color="accent" />}
            </Pressable>
          );
        })}
      </View>
      <Text className="text-sm text-text-muted">
        {t('languageFoot')}
      </Text>
    </View>
  );
};
