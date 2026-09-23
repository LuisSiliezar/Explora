import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SectionLabel, Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { enter } from '@presentation/theme';
import { formatDistance } from '@presentation/utils';

interface Props {
  location: string;
  /** km from the user; the column is hidden when null. */
  distance: number | null;
}

/** Location and "Near me" distance between two rules. */
export const DetailMeta = ({ location, distance }: Props) => {
  const t = useT();
  return (
    <Animated.View
      entering={enter(1)}
      className="flex-row gap-[22px] border-y border-border py-3.5"
    >
      <View className="flex-1 gap-1">
        <SectionLabel>{t('locationLabel')}</SectionLabel>
        <Text className="font-sans-semibold text-lg">{location}</Text>
      </View>
      {distance !== null && (
        <View className="gap-1">
          <SectionLabel>{t('nearMe').toUpperCase()}</SectionLabel>
          <Text className="font-sans-semibold text-lg">
            {t('away', { s: formatDistance(distance) })}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};
