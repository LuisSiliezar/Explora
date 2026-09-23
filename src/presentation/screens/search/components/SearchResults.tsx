import React, { type ReactElement } from 'react';
import { View } from 'react-native';
import type { ActivityWithDistance } from '@core/use-cases';
import type { Activity } from '@domain/entities';
import { ActivityList, ActivitySkeleton, Text } from '@presentation/components';
import { useT } from '@presentation/i18n';

interface Props {
  rows: readonly ActivityWithDistance[];
  /** The query is still inside its debounce window: show the skeleton. */
  isSearching: boolean;
  onPressItem: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  ListEmptyComponent: ReactElement;
}

/** Search tab: "All results" as rows, or a skeleton while the query settles. */
export const SearchResults = ({
  rows,
  isSearching,
  onPressItem,
  onToggleFavorite,
  ListEmptyComponent,
}: Props) => {
  const t = useT();
  return (
    <View className="flex-1 gap-3">
      <Text
        accessibilityRole="header"
        className="px-5 font-display-bold text-2xl tracking-tight"
      >
        {t('allResults')}
      </Text>
      <View className="flex-1">
        {isSearching ? (
          <ActivitySkeleton />
        ) : (
          <ActivityList
            rows={rows}
            onPressItem={onPressItem}
            onToggleFavorite={onToggleFavorite}
            ListEmptyComponent={ListEmptyComponent}
          />
        )}
      </View>
    </View>
  );
};
