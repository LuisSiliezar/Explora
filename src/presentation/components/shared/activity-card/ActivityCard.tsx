import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import type { ActivityWithDistance } from '@core/use-cases';
import type { Activity } from '@domain/entities';
import { useT } from '@presentation/i18n/useT';
import { ActivityThumb } from '../ActivityThumb';
import { FavoriteButton } from '../FavoriteButton';
import { Text } from '../Text';
import { ActivityPills, RemoveButton } from './components';
import { useActivityCardHandlers } from './hooks';
import { activityA11yLabel } from './utils';

export interface ActivityCardProps {
  row: ActivityWithDistance;
  onPress: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  /** Favorites edit mode: a Remove button replaces the heart. */
  removable?: boolean;
}

/** Result row (search, Favorites). Memoized and subscribed only to its own favorite flag: 1000+ rows stay cheap. */
export const ActivityCard = memo(
  ({
    row: { activity, distanceKm },
    onPress,
    onToggleFavorite,
    removable,
  }: ActivityCardProps) => {
    const t = useT();
    const { isFavorite, handlePress, handleToggle, favoriteLabel } =
      useActivityCardHandlers(activity, onPress, onToggleFavorite);

    return (
      <View className="flex-row items-center gap-3.5">
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={activityA11yLabel(activity)}
          accessibilityHint={t('opensDetails')}
          testID={`activity-card-${activity.id}`}
          className="flex-1 flex-row items-center gap-3.5 active:opacity-70"
        >
          <ActivityThumb activity={activity} variant="thumb" />
          <View className="flex-1 gap-1">
            <Text
              numberOfLines={2}
              className="font-display-bold text-lg tracking-tight"
            >
              {activity.title}
            </Text>
            <Text numberOfLines={1} className="text-base text-text-muted">
              {activity.location}
            </Text>
            <ActivityPills
              category={activity.category}
              distanceKm={distanceKm}
              className="mt-0.5 gap-1.5"
            />
          </View>
        </Pressable>
        {removable ? (
          <RemoveButton
            title={activity.title}
            onPress={handleToggle}
            testID={`favorite-${activity.id}`}
          />
        ) : (
          <FavoriteButton
            isFavorite={isFavorite}
            onPress={handleToggle}
            testID={`favorite-${activity.id}`}
            accessibilityLabel={favoriteLabel}
          />
        )}
      </View>
    );
  },
);
