import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityList,
  EmptyState,
  OfflineBanner,
  Text,
} from '@presentation/components';
import {
  useDependencies,
  useFavorites,
  useOpenActivity,
  useToggleFavorite,
} from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import type { TabScreenProps } from '@presentation/routes/types';

/** Reads only from local storage: works with no network at all. */
export const FavoritesScreen = ({
  navigation,
}: TabScreenProps<'Favorites'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { haptics } = useDependencies();
  const { favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const openActivity = useOpenActivity();
  const [editing, setEditing] = useState(false);
  const rows = useMemo(
    () => favorites.map(fav => ({ activity: fav.activity, distanceKm: null })),
    [favorites],
  );
  const hasFavorites = rows.length > 0;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <OfflineBanner message={t('offlineFavorites')} />
      <View className="flex-row items-baseline justify-between px-5 pb-3.5 pt-3">
        <View className="gap-1">
          <Text
            accessibilityRole="header"
            className="font-sans-bold text-[26px] tracking-[-0.5px]"
          >
            {t('favorites')}
          </Text>
          <Text className="font-mono text-[11px] text-text-muted">
            {rows.length} {t('saved')}
          </Text>
        </View>
        {hasFavorites && (
          <Pressable
            onPress={() => {
              haptics.selection();
              setEditing(!editing);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t(editing ? 'done' : 'edit')}
          >
            <Text className="font-sans-semibold text-[15px] text-accent">
              {t(editing ? 'done' : 'edit')}
            </Text>
          </Pressable>
        )}
      </View>
      {hasFavorites ? (
        <ActivityList
          rows={rows}
          removable={editing}
          onPressItem={openActivity}
          onToggleFavorite={toggleFavorite}
          ListFooterComponent={
            <Text className="mt-4 font-mono text-[11px] leading-[18px] tracking-[0.6px] text-text-muted">
              {t('savedOnDevice')}
            </Text>
          }
        />
      ) : (
        <EmptyState
          icon="heart"
          title={t('emptyFav')}
          body={t('emptyFavBody')}
          actionLabel={t('browseActivities')}
          onAction={() => navigation.navigate('Browse')}
        />
      )}
    </View>
  );
};
