import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityList,
  EmptyState,
  OfflineBanner,
  Text,
} from '@presentation/components';
import {
  useDependencies,
  useOpenActivity,
  useToggleFavorite,
} from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import type { TabScreenProps } from '@presentation/routes/types';
import { enter } from '@presentation/theme';
import { FavoritesHeader } from './components';
import { useFavoriteRows } from './hooks';

/** Reads only from local storage: works with no network at all. */
export const FavoritesScreen = ({
  navigation,
}: TabScreenProps<'Favorites'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { haptics } = useDependencies();
  const rows = useFavoriteRows();
  const toggleFavorite = useToggleFavorite();
  const openActivity = useOpenActivity();
  const [editing, setEditing] = useState(false);
  const hasFavorites = rows.length > 0;

  const toggleEditing = () => {
    haptics.selection();
    setEditing(!editing);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <OfflineBanner message={t('offlineFavorites')} />
      <FavoritesHeader
        count={rows.length}
        editing={editing}
        onToggleEditing={hasFavorites ? toggleEditing : undefined}
      />
      <Animated.View entering={enter(1)} className="flex-1">
        {hasFavorites ? (
          <ActivityList
            rows={rows}
            removable={editing}
            onPressItem={openActivity}
            onToggleFavorite={toggleFavorite}
            ListFooterComponent={
              <Text className="mt-4 font-sans-medium text-xs tracking-wider text-text-muted">
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
      </Animated.View>
    </View>
  );
};
