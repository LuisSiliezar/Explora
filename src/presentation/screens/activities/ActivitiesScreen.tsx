import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineBanner, Text } from '@presentation/components';
import {
  useActivities,
  useActivityFilter,
  useActivityRows,
  useNearMe,
  useOpenActivity,
  useToggleFavorite,
} from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import type { TabScreenProps } from '@presentation/routes/types';
import {
  ActivitiesContent,
  CategoryChips,
  LocatingOverlay,
  LocationDeniedBanner,
  LocationPromptDialog,
} from './components';
import { useRefreshActivities } from './hooks';

export const ActivitiesScreen = ({ navigation }: TabScreenProps<'Browse'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { data, error, isPending, isError, refetch, dataUpdatedAt } =
    useActivities();
  const filter = useActivityFilter(data);
  const nearMe = useNearMe();
  const rows = useActivityRows(filter.browseResults, nearMe.origin);
  const { refreshing, onRefresh } = useRefreshActivities(refetch);
  const toggleFavorite = useToggleFavorite();
  const openActivity = useOpenActivity();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <OfflineBanner message={t('offlineBrowse')} />

      <View className="gap-4 px-5 pb-4 pt-3">
        <Text
          accessibilityRole="header"
          testID="browse-title"
          className="font-display-bold text-4xl leading-tight tracking-tight"
        >
          Explora
        </Text>
        <CategoryChips
          nearMeActive={nearMe.active}
          permission={nearMe.permission}
          onPressNearMe={nearMe.onPressNearMe}
          allCategories={filter.allCategories}
          categories={filter.categories}
          onToggleCategory={filter.toggleCategory}
        />
      </View>

      <View className="flex-1">
        <ActivitiesContent
          isPending={isPending}
          error={isError ? error : null}
          hasData={!!data}
          dataUpdatedAt={dataUpdatedAt}
          onRetry={refetch}
          onGoFavorites={() => navigation.navigate('Favorites')}
          rows={rows}
          sortKey={nearMe.origin ? 'by-distance' : 'by-title'}
          onPressItem={openActivity}
          onToggleFavorite={toggleFavorite}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onClearFilters={filter.reset}
        />
      </View>

      {nearMe.bannerVisible && (
        <LocationDeniedBanner onDismiss={nearMe.dismissBanner} />
      )}
      {nearMe.locating && <LocatingOverlay />}

      <LocationPromptDialog
        visible={nearMe.promptVisible}
        onAllow={nearMe.allow}
        onDeny={nearMe.deny}
        onCancel={nearMe.cancel}
      />
    </View>
  );
};
