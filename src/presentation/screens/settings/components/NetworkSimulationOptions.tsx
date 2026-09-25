import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon, Text } from '@presentation/components';
import { useDependencies, useDevSettings } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { NETWORK_MODES } from '../constants';

/** Developer sub-screen: pick how the simulated network answers (normal, slow, failing). */
export const NetworkSimulationOptions = () => {
  const t = useT();
  const { devSettingsStore, haptics } = useDependencies();
  const network = useDevSettings(state => state.network);

  return (
    <View className="gap-4">
      <Text
        accessibilityRole="header"
        className="font-sans-semibold text-xs tracking-wider text-text-muted"
      >
        {t('devNetwork').toUpperCase()}
      </Text>
      <View accessibilityRole="radiogroup">
        {NETWORK_MODES.map(mode => {
          const active = mode.value === network;
          return (
            <Pressable
              key={mode.value}
              onPress={() => {
                if (!active) {
                  haptics.selection();
                  devSettingsStore.getState().setNetwork(mode.value);
                }
              }}
              accessibilityRole="radio"
              accessibilityLabel={t(mode.name)}
              accessibilityHint={t(mode.hint)}
              accessibilityState={{ checked: active }}
              testID={`dev-network-${mode.value}`}
              className="flex-row items-center gap-3 border-b border-border py-4"
            >
              <View className="flex-1 gap-1">
                <Text className="font-display-semibold text-xl">
                  {t(mode.name)}
                </Text>
                <Text className="text-sm text-text-muted">{t(mode.hint)}</Text>
              </View>
              {active && <Icon name="check" size={22} color="accent" />}
            </Pressable>
          );
        })}
      </View>
      <Text className="text-sm text-text-muted">{t('devNetworkFoot')}</Text>
    </View>
  );
};
