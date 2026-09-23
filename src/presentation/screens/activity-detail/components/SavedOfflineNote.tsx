import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon, Text } from '@presentation/components';
import { useT } from '@presentation/i18n';

/** Green note confirming a favorite is available offline. */
export const SavedOfflineNote = () => {
  const t = useT();
  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      className="flex-row items-center gap-2.5 rounded-[10px] bg-success px-3.5 py-3"
    >
      <Icon name="heart" size={17} color="accent" filled />
      <Text className="flex-1 font-sans-semibold text-base">
        {t('savedOffline')}
      </Text>
    </Animated.View>
  );
};
