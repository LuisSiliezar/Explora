import React, { useCallback } from 'react';
import { View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { ActivityWithDistance } from '@core/use-cases';
import type { Activity } from '@domain/entities';
import {
  ActivityCarouselCard,
  CAROUSEL_CARD_GAP,
} from '@presentation/components/shared';
import { spacing } from '@presentation/theme';

interface Props {
  rows: readonly ActivityWithDistance[];
  onPressItem: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
}

const keyExtractor = (row: ActivityWithDistance) => row.activity.id;
const Separator = () => <View style={{ width: CAROUSEL_CARD_GAP }} />;
const CONTENT_STYLE = { paddingHorizontal: spacing.xl };

/** Horizontal, virtualized row of carousel cards: a category can hold hundreds of items. */
export const ActivityCarousel = ({
  rows,
  onPressItem,
  onToggleFavorite,
}: Props) => {
  const renderItem: ListRenderItem<ActivityWithDistance> = useCallback(
    ({ item }) => (
      <ActivityCarouselCard
        row={item}
        onPress={onPressItem}
        onToggleFavorite={onToggleFavorite}
      />
    ),
    [onPressItem, onToggleFavorite],
  );

  return (
    <FlashList
      horizontal
      data={rows}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={Separator}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={CONTENT_STYLE}
    />
  );
};
