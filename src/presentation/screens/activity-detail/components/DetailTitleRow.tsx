import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { Activity } from '@domain/entities';
import { FavoriteButton, Pill, Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { enter } from '@presentation/theme';

interface Props {
  activity: Activity;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

/** Category pill and title, with the big favorite button beside them. */
export const DetailTitleRow = ({
  activity,
  isFavorite,
  onToggleFavorite,
}: Props) => {
  const t = useT();
  return (
    <Animated.View entering={enter(0)} className="flex-row items-start gap-3.5">
      <View className="flex-1 gap-2">
        <Pill label={activity.category.toUpperCase()} />
        <Text
          accessibilityRole="header"
          className="font-display-bold text-3xl leading-tight tracking-tight"
        >
          {activity.title}
        </Text>
      </View>
      <FavoriteButton
        variant="circle"
        isFavorite={isFavorite}
        onPress={onToggleFavorite}
        testID="detail-favorite"
        accessibilityLabel={t(
          isFavorite ? 'removeFromFavorites' : 'addToFavorites',
          { s: activity.title },
        )}
      />
    </Animated.View>
  );
};
