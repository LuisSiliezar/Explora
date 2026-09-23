import React from 'react';
import { Pressable, View } from 'react-native';
import { BottomSheet, Icon, Text } from '@presentation/components';
import { useDependencies, useSettings, useToast } from '@presentation/hooks';
import { LANGUAGES, translate, useT } from '@presentation/i18n';

export const LanguageSheet = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const t = useT();
  const toast = useToast();
  const { settingsStore, haptics } = useDependencies();
  const language = useSettings(state => state.language);

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={t('done')}>
      <View className="flex-row items-center justify-between">
        <Text
          accessibilityRole="header"
          className="font-sans-bold text-[20px] tracking-[-0.2px]"
        >
          {t('language')}
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('done')}
        >
          <Text className="font-sans-semibold text-[15px] text-accent">
            {t('done')}
          </Text>
        </Pressable>
      </View>
      <View>
        {LANGUAGES.map(option => {
          const active = option.code === language;
          return (
            <Pressable
              key={option.code}
              onPress={() => {
                haptics.selection();
                settingsStore.getState().setLanguage(option.code);
                toast.show(translate(option.code, 'toastLang'));
                onClose();
              }}
              accessibilityRole="radio"
              accessibilityLabel={option.name}
              accessibilityState={{ checked: active }}
              className="flex-row items-center gap-3 border-b border-border py-[15px]"
            >
              <Text className="flex-1 font-sans-semibold text-[16px]">
                {option.name}
              </Text>
              {active && <Icon name="check" size={20} color="accent" />}
            </Pressable>
          );
        })}
      </View>
      <Text className="text-[13px] leading-[19px] text-text-muted">
        {t('languageFoot')}
      </Text>
    </BottomSheet>
  );
};
