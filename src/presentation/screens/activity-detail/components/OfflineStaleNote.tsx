import React from 'react';
import { View } from 'react-native';
import { Button, Text } from '@presentation/components';
import { useT } from '@presentation/i18n';

/** Offline: explains the data may be stale, with a disabled refresh. */
export const OfflineStaleNote = () => {
  const t = useT();
  return (
    <View className="gap-2.5" testID="detail-stale-note">
      <Text className="text-sm text-text-muted">{t('staleNote')}</Text>
      <Button
        label={t('refreshUnavailable')}
        variant="secondary"
        size="sm"
        disabled
        onPress={() => undefined}
      />
    </View>
  );
};
