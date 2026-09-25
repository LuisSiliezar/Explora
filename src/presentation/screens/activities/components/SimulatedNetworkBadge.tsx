import React from 'react';
import { View } from 'react-native';
import { Text } from '@presentation/components';
import { useDevSettings } from '@presentation/hooks';
import type { NetworkSimulation } from '@domain/entities';
import { useT, type StringKey } from '@presentation/i18n';

const MODE_NAMES: Record<Exclude<NetworkSimulation, 'normal'>, StringKey> = {
  slow: 'devNetworkSlow',
  fail: 'devNetworkFail',
};

/** Dev/staging reminder that requests are being slowed down or failed on purpose. */
export const SimulatedNetworkBadge = () => {
  const t = useT();
  const network = useDevSettings(state => state.network);
  if (network === 'normal') {
    return null;
  }
  return (
    <View
      testID="simulated-network-badge"
      className="self-start rounded-full bg-danger-surface px-3 py-1"
    >
      <Text className="font-sans-semibold text-xs text-danger">
        {t('devSimBadge', { s: t(MODE_NAMES[network]) })}
      </Text>
    </View>
  );
};
