import React, { type ComponentType } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '@presentation/i18n';
import type { RootStackScreenProps } from '@presentation/routes/types';
import {
  DataPanel,
  LanguageOptions,
  LocationPermissionRow,
  NotificationsPanel,
  SettingsHeader,
  TextSizePicker,
} from './components';
import { SETTINGS_SECTIONS, type SettingsSectionKey } from './constants';

const SECTION_CONTENT: Record<SettingsSectionKey, ComponentType> = {
  language: LanguageOptions,
  notifications: NotificationsPanel,
  textSize: TextSizePicker,
  location: LocationPermissionRow,
  data: DataPanel,
};

/** One Settings sub-screen, pushed from a row on the Settings page. */
export const SettingsDetailScreen = ({
  route,
  navigation,
}: RootStackScreenProps<'SettingsDetail'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { section } = route.params;
  const title = SETTINGS_SECTIONS.find(s => s.key === section)?.title;
  const Content = SECTION_CONTENT[section];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerClassName="gap-5 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <SettingsHeader
          title={title ? t(title) : ''}
          onBack={navigation.goBack}
        />
        <Content />
      </ScrollView>
    </View>
  );
};
