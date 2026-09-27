import React from 'react';
import type { ActivityWithDistance } from '@core/use-cases';
import type { Activity } from '@domain/entities';
import { isDomainError } from '@domain/errors';
import {
  CarouselSkeleton,
  EmptyState,
  ErrorState,
} from '@presentation/components';
import { useSettings } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { formatSyncTime } from '@presentation/utils';
import { CategorySections } from './CategorySections';

interface Props {
  isPending: boolean;
  /** Set only when there is no cached catalog to fall back on. */
  error: unknown;
  hasData: boolean;
  dataUpdatedAt: number;
  onRetry: () => void;
  onGoFavorites: () => void;
  rows: readonly ActivityWithDistance[];
  /** Remounts the list so a new sort order starts at the top. */
  sortKey: string;
  onPressItem: (activity: Activity) => void;
  onToggleFavorite: (activity: Activity) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onClearFilters: () => void;
}

/** Skeleton while loading, an error with no catalog, otherwise the category carousels. */
export const ActivitiesContent = ({
  isPending,
  error,
  hasData,
  dataUpdatedAt,
  onRetry,
  onGoFavorites,
  rows,
  sortKey,
  onPressItem,
  onToggleFavorite,
  refreshing,
  onRefresh,
  onClearFilters,
}: Props) => {
  const t = useT();
  const language = useSettings(state => state.language);

  if (isPending) {
    return <CarouselSkeleton />;
  }
  if (error && !hasData) {
    const offline = isDomainError(error) && error.code === 'OFFLINE';
    return (
      <ErrorState
        title={t(offline ? 'offlineNoCatalogTitle' : 'errorTitle')}
        body={t(offline ? 'offlineNoCatalogBody' : 'errorBody')}
        retryLabel={t('retry')}
        onRetry={onRetry}
        secondaryLabel={t('goFavorites')}
        onSecondary={onGoFavorites}
        code={t('errorCode', {
          s: formatSyncTime(dataUpdatedAt, language, t('never')),
        })}
      />
    );
  }
  const empty = (
    <EmptyState
      title={t('emptyNoMatch')}
      body={t('emptyNoMatchBody')}
      actionLabel={t('clearFilters')}
      onAction={onClearFilters}
    />
  );
  return (
    <CategorySections
      key={sortKey}
      rows={rows}
      onPressItem={onPressItem}
      onToggleFavorite={onToggleFavorite}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={empty}
    />
  );
};
