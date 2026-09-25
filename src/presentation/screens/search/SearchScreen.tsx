import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isDomainError } from '@domain/errors';
import {
  ActivitySkeleton,
  EmptyState,
  ErrorState,
  OfflineBanner,
} from '@presentation/components';
import {
  useActivities,
  useActivityFilter,
  useActivityRows,
  useNearMe,
  useOpenActivity,
  useRefreshActivities,
  useToggleFavorite,
} from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import type { TabScreenProps } from '@presentation/routes/types';
import { SearchField, SearchFilters, SearchResults } from './components';

export const SearchScreen = (_props: TabScreenProps<'Search'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { data, error, isPending, isError, refetch } = useActivities();
  const filter = useActivityFilter(data);
  const { origin } = useNearMe();
  const rows = useActivityRows(filter.results, origin);
  const toggleFavorite = useToggleFavorite();
  const openActivity = useOpenActivity();
  const { refreshing, onRefresh } = useRefreshActivities();

  const renderContent = () => {
    if (isPending) {
      return <ActivitySkeleton />;
    }
    if (isError && !data) {
      const offline = isDomainError(error) && error.code === 'OFFLINE';
      return (
        <ErrorState
          title={t(offline ? 'offlineNoCatalogTitle' : 'errorTitle')}
          body={t(offline ? 'offlineNoCatalogBody' : 'errorBody')}
          retryLabel={t('retry')}
          onRetry={refetch}
        />
      );
    }
    return (
      <SearchResults
        key={origin ? 'by-distance' : 'by-title'}
        rows={rows}
        isSearching={filter.isSearching}
        onPressItem={openActivity}
        onToggleFavorite={toggleFavorite}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <EmptyState
            title={t('emptyNoMatch')}
            body={t('emptyNoMatchBody')}
            actionLabel={t('clearFilters')}
            onAction={filter.reset}
          />
        }
      />
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <OfflineBanner message={t('offlineBrowse')} />
      <View className="gap-4 px-5 pb-4 pt-3">
        <SearchField query={filter.query} onChangeQuery={filter.setQuery} />
        <SearchFilters
          allCategories={filter.allCategories}
          categories={filter.categories}
          onToggleCategory={filter.toggleCategory}
          duration={filter.duration}
          onToggleDuration={filter.toggleDuration}
          resultCount={filter.results.length}
          hasFilters={filter.hasFilters}
          onClearAll={filter.reset}
        />
      </View>
      <View className="flex-1">{renderContent()}</View>
    </View>
  );
};
