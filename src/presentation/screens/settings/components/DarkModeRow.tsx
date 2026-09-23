import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Text, Toggle } from '@presentation/components';
import { useDependencies } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { useTheme } from '@presentation/theme';

/** Dark mode switch, styled like a Settings link row. Starts from the device scheme until the user flips it. */
export const DarkModeRow = () => {
  const t = useT();
  const { settingsStore } = useDependencies();
  const { scheme } = useTheme();
  const onValueChange = useCallback(
    (dark: boolean) =>
      settingsStore.getState().setColorScheme(dark ? 'dark' : 'light'),
    [settingsStore],
  );
  return (
    <View
      testID="settings-darkMode"
      className="flex-row items-center gap-3 border-b border-border py-6"
    >
      <Text numberOfLines={1} className="flex-1 font-display-semibold text-xl">
        {t('darkMode')}
      </Text>
      <Toggle
        value={scheme === 'dark'}
        onValueChange={onValueChange}
        accessibilityLabel={t('darkMode')}
      />
    </View>
  );
};
