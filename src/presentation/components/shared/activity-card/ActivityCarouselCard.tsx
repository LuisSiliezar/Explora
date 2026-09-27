import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useT } from '@presentation/i18n/useT';
import { ActivityThumb } from '../ActivityThumb';
import { FavoriteButton } from '../FavoriteButton';
import { Text } from '../Text';
import type { ActivityCardProps } from './ActivityCard';
import { ActivityPills } from './components';
import { CAROUSEL_CARD_WIDTH } from './constants';
import { useActivityCardHandlers } from './hooks';
import { activityA11yLabel } from './utils';

/** Tall carousel card: the photo with a heart on it, then the title and the place. */
export const ActivityCarouselCard = memo(
  ({
    row: { activity, distanceKm },
    onPress,
    onToggleFavorite,
  }: Omit<ActivityCardProps, 'removable'>) => {
    const t = useT();
    const { isFavorite, handlePress, handleToggle, favoriteLabel } =
      useActivityCardHandlers(activity, onPress, onToggleFavorite);

    return (
      <View style={{ width: CAROUSEL_CARD_WIDTH }}>
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={activityA11yLabel(activity)}
          accessibilityHint={t('opensDetails')}
          testID={`activity-card-${activity.id}`}
          className="gap-2.5 active:opacity-80"
        >
          <ActivityThumb activity={activity} variant="card" />
          <View className="gap-1">
            <Text
              numberOfLines={2}
              className="font-display-semibold text-xl tracking-tight"
            >
              {activity.title}
            </Text>
            <Text numberOfLines={1} className="text-base text-text-muted">
              {activity.location}
            </Text>
            {distanceKm !== null && (
              <ActivityPills
                category={activity.category}
                distanceKm={distanceKm}
                className="mt-1 gap-1.5"
              />
            )}
          </View>
        </Pressable>
        <View className="absolute right-2.5 top-2.5">
          <FavoriteButton
            variant="overlay"
            isFavorite={isFavorite}
            onPress={handleToggle}
            testID={`favorite-${activity.id}`}
            accessibilityLabel={favoriteLabel}
          />
        </View>
      </View>
    );
  },
);
