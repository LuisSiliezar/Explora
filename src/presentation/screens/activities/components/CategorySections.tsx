import React, { useCallback, useMemo, type ReactElement } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import {
  groupByCategory,
  type ActivityWithDistance,
  type CategorySection,
} from '@core/use-cases';
import type { Activity } from '@domain/entities';
import { ActivityCarousel, Text } from '@presentation/components';
import { useTabBarHeight } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { spacing, useTheme } from '@presentation/theme';
import { countLabelKey } from '../utils';

interface Props {
  rows: readonly ActivityWithDistance[];
  onPressItem: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  refreshing: boolean;
  onRefresh: () => void;
  ListEmptyComponent: ReactElement;
}

const keyExtractor = (section: CategorySection) => section.category;
const Separator = () => <View style={{ height: spacing.xxl + 4 }} />;
// Sections are re-grouped on every sort or filter; never anchor to a previous one.
const KEEP_POSITION_OFF = { disabled: true };

/** Browse: one titled, horizontally scrolling carousel per category. */
export const CategorySections = ({
  rows,
  onPressItem,
  onToggleFavorite,
  refreshing,
  onRefresh,
  ListEmptyComponent,
}: Props) => {
  const t = useT();
  const { colors } = useTheme();
  const sections = useMemo(() => groupByCategory(rows), [rows]);
  const tabBarHeight = useTabBarHeight();
  const contentStyle = useMemo(
    () => ({
      paddingTop: spacing.xs,
      paddingBottom: spacing.xxl + tabBarHeight,
    }),
    [tabBarHeight],
  );

  const renderItem: ListRenderItem<CategorySection> = useCallback(
    ({ item }) => (
      <View className="gap-3.5">
        <View className="gap-0.5 px-5">
          <Text
            accessibilityRole="header"
            className="font-display-bold text-2xl tracking-tight"
          >
            {item.category}
          </Text>
          <Text className="text-base text-text-muted">
            {item.rows.length} {t(countLabelKey(item.rows.length))}
          </Text>
        </View>
        <ActivityCarousel
          rows={item.rows}
          onPressItem={onPressItem}
          onToggleFavorite={onToggleFavorite}
        />
      </View>
    ),
    [t, onPressItem, onToggleFavorite],
  );

  return (
    <FlashList
      data={sections}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={contentStyle}
      maintainVisibleContentPosition={KEEP_POSITION_OFF}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    />
  );
};
