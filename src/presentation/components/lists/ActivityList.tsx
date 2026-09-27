import React, { useCallback, useMemo, type ReactElement } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { ActivityWithDistance } from '@core/use-cases';
import type { Activity } from '@domain/entities';
import { ActivityCard } from '@presentation/components/shared';
import { useTabBarHeight } from '@presentation/hooks/useTabBarHeight';
import { spacing, useTheme } from '@presentation/theme';

interface Props {
  rows: readonly ActivityWithDistance[];
  onPressItem: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  /** Favorites edit mode. */
  removable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: ReactElement;
  ListFooterComponent?: ReactElement;
  ListEmptyComponent?: ReactElement;
}

const keyExtractor = (row: ActivityWithDistance) => row.activity.id;
// FlashList v2 anchors the visible item across data changes by default, so a re-sort
// ("Near me") would jump to wherever that item landed. These lists never prepend items.
const KEEP_POSITION_OFF = { disabled: true };
const Separator = () => <View style={{ height: spacing.lg }} />;

/** Virtualized list (FlashList recycles cells): built for 1000+ items. */
export const ActivityList = ({
  rows,
  onPressItem,
  onToggleFavorite,
  removable,
  refreshing = false,
  onRefresh,
  ...rest
}: Props) => {
  const { colors } = useTheme();
  const tabBarHeight = useTabBarHeight();
  const contentStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl + tabBarHeight,
    }),
    [tabBarHeight],
  );

  const renderItem: ListRenderItem<ActivityWithDistance> = useCallback(
    ({ item }) => (
      <ActivityCard
        row={item}
        onPress={onPressItem}
        onToggleFavorite={onToggleFavorite}
        removable={removable}
      />
    ),
    [onPressItem, onToggleFavorite, removable],
  );

  return (
    <FlashList
      data={rows}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={contentStyle}
      maintainVisibleContentPosition={KEEP_POSITION_OFF}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        ) : undefined
      }
      {...rest}
    />
  );
};
