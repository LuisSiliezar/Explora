import React from 'react';
import { Linking, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Banner, Button } from '@presentation/components';
import { useTabBarHeight } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { spacing } from '@presentation/theme';

/** Floating banner shown after location is denied: open settings or dismiss. Sits above the tab bar. */
export const LocationDeniedBanner = ({
  onDismiss,
}: {
  onDismiss: () => void;
}) => {
  const t = useT();
  const tabBarHeight = useTabBarHeight();
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      className="absolute left-5 right-5"
      style={{ bottom: tabBarHeight + spacing.md }}
    >
      <Banner tone="danger" title={t('locOffTitle')} body={t('locOffBody')}>
        <View className="mt-3 flex-row gap-2">
          <Button
            label={t('openSettings')}
            variant="inverse"
            size="sm"
            onPress={() => Linking.openSettings()}
          />
          <Button
            label={t('dismiss')}
            variant="secondary"
            size="sm"
            onPress={onDismiss}
          />
        </View>
      </Banner>
    </Animated.View>
  );
};
