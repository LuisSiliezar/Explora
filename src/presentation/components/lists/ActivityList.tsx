import React, { useCallback, type ReactElement } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { ActivityWithDistance } from '@core/use-cases';
import type { Activity, ListLayout } from '@domain/entities';
import {
  ActivityCard,
  ActivityGridCard,
} from '@presentation/components/shared';
import { spacing, useTheme } from '@presentation/theme';

interface Props {
  rows: readonly ActivityWithDistance[];
  onPressItem: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  layout?: ListLayout;
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

/** Virtualized list (FlashList recycles cells): built for 1000+ items, as a list or a 2-col grid. */
export const ActivityList = ({
  rows,
  onPressItem,
  onToggleFavorite,
  layout = 'list',
  removable,
  refreshing = false,
  onRefresh,
  ...rest
}: Props) => {
  const { colors } = useTheme();
  const grid = layout === 'grid';

  const renderItem: ListRenderItem<ActivityWithDistance> = useCallback(
    ({ item, index }) =>
      grid ? (
        <View className={index % 2 ? 'pl-2' : 'pr-2'}>
          <ActivityGridCard
            row={item}
            onPress={onPressItem}
            onToggleFavorite={onToggleFavorite}
          />
        </View>
      ) : (
        <ActivityCard
          row={item}
          onPress={onPressItem}
          onToggleFavorite={onToggleFavorite}
          removable={removable}
        />
      ),
    [grid, onPressItem, onToggleFavorite, removable],
  );

  return (
    <FlashList
      key={layout} // numColumns can't change on the fly
      data={rows}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={grid ? 2 : 1}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={{
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
      }}
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
