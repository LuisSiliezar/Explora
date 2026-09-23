import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { env } from '@config/env';
import { Text } from '@presentation/components';
import { useTabBarHeight } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import type { TabScreenProps } from '@presentation/routes/types';
import { enter, spacing } from '@presentation/theme';
import { SettingsHeader, SettingsLinkRow } from './components';
import { APP_VERSION, SETTINGS_SECTIONS } from './constants';
import { useSettingsSummary } from './hooks';

/** Settings: a list of rows, each pushing its own sub-screen. */
export const SettingsScreen = ({ navigation }: TabScreenProps<'Settings'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const summary = useSettingsSummary();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerClassName="gap-4 px-6 pt-10"
        contentContainerStyle={{ paddingBottom: spacing.xxl + tabBarHeight }}
      >
        <SettingsHeader title={t('settings')} />
        <Animated.View entering={enter(1)}>
          {SETTINGS_SECTIONS.map(({ key, title }) => (
            <SettingsLinkRow
              key={key}
              label={t(title)}
              value={summary[key]}
              onPress={() =>
                navigation.navigate('SettingsDetail', { section: key })
              }
              testID={`settings-${key}`}
            />
          ))}
        </Animated.View>
        <Text className="font-sans-medium text-xs tracking-wider text-text-muted">
          {t('version', {
            s: `${APP_VERSION} · ${env.APP_ENV.toUpperCase()}`,
          })}
        </Text>
      </ScrollView>
    </View>
  );
};
