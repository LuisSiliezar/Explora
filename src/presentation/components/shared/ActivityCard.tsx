import React, { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import type { ActivityWithDistance } from '@core/use-cases';
import type { Activity } from '@domain/entities';
import { useIsFavorite } from '@presentation/hooks/useFavorites';
import { useT } from '@presentation/i18n/useT';
import { formatDistance } from '@presentation/utils';
import { ActivityThumb } from './ActivityThumb';
import { FavoriteButton } from './FavoriteButton';
import { Pill } from './Pill';
import { Text } from './Text';

export interface ActivityCardProps {
  row: ActivityWithDistance;
  onPress: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  /** Favorites edit mode: a Remove button replaces the heart. */
  removable?: boolean;
}

/** List row. Memoized and subscribed only to its own favorite flag: 1000+ rows stay cheap. */
export const ActivityCard = memo(
  ({
    row: { activity, distanceKm },
    onPress,
    onToggleFavorite,
    removable,
  }: ActivityCardProps) => {
    const t = useT();
    const isFavorite = useIsFavorite(activity.id);
    const handlePress = useCallback(
      () => onPress(activity),
      [activity, onPress],
    );
    const handleToggle = useCallback(
      () => onToggleFavorite(activity),
      [activity, onToggleFavorite],
    );

    return (
      <View className="flex-row items-start gap-[13px]">
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`${activity.title}, ${activity.category}, ${activity.durationMinutes} min, ${activity.location}`}
          accessibilityHint={t('opensDetails')}
          className="flex-1 flex-row items-start gap-[13px] active:opacity-70"
        >
          <ActivityThumb activity={activity} variant="thumb" />
          <View className="flex-1 gap-[5px]">
            <View className="flex-row flex-wrap gap-1.5">
              <Pill label={activity.category.toUpperCase()} />
              {distanceKm !== null && (
                <Pill label={formatDistance(distanceKm)} tone="neutral" />
              )}
            </View>
            <Text
              numberOfLines={2}
              className="font-sans-semibold text-[17px] leading-[20px] tracking-[-0.2px]"
            >
              {activity.title}
            </Text>
            <Text numberOfLines={1} className="text-[13px] text-text-muted">
              {activity.location}
            </Text>
          </View>
        </Pressable>
        {removable ? (
          <Pressable
            onPress={handleToggle}
            accessibilityRole="button"
            accessibilityLabel={t('removeFromFavorites', { s: activity.title })}
            className="rounded-[9px] border border-danger-border bg-danger-surface px-3 py-2 active:opacity-80"
          >
            <Text className="font-sans-semibold text-[13px] text-danger">
              {t('remove')}
            </Text>
          </Pressable>
        ) : (
          <FavoriteButton
            isFavorite={isFavorite}
            onPress={handleToggle}
            accessibilityLabel={t(
              isFavorite ? 'removeFromFavorites' : 'addToFavorites',
              { s: activity.title },
            )}
          />
        )}
      </View>
    );
  },
);

/** Two-column grid cell. */
export const ActivityGridCard = memo(
  ({
    row: { activity, distanceKm },
    onPress,
    onToggleFavorite,
  }: ActivityCardProps) => {
    const t = useT();
    const isFavorite = useIsFavorite(activity.id);
    const handlePress = useCallback(
      () => onPress(activity),
      [activity, onPress],
    );
    const handleToggle = useCallback(
      () => onToggleFavorite(activity),
      [activity, onToggleFavorite],
    );

    return (
      <View className="gap-2">
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`${activity.title}, ${activity.category}, ${activity.durationMinutes} min, ${activity.location}`}
          accessibilityHint={t('opensDetails')}
          className="gap-2 active:opacity-70"
        >
          <ActivityThumb activity={activity} variant="grid" />
        </Pressable>
        <View className="flex-row items-start gap-2">
          <Pressable
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={activity.title}
            className="flex-1 gap-1"
          >
            <View className="flex-row flex-wrap gap-1">
              <Pill label={activity.category.toUpperCase()} />
              {distanceKm !== null && (
                <Pill label={formatDistance(distanceKm)} tone="neutral" />
              )}
            </View>
            <Text
              numberOfLines={2}
              className="font-sans-semibold text-[15px] leading-[19px]"
            >
              {activity.title}
            </Text>
            <Text numberOfLines={1} className="text-[12px] text-text-muted">
              {activity.location}
            </Text>
          </Pressable>
          <FavoriteButton
            isFavorite={isFavorite}
            onPress={handleToggle}
            compact
            accessibilityLabel={t(
              isFavorite ? 'removeFromFavorites' : 'addToFavorites',
              { s: activity.title },
            )}
          />
        </View>
      </View>
    );
  },
);
