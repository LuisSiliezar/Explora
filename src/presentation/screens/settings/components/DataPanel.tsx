import React from 'react';
import { useActivities, useFavorites } from '@presentation/hooks';
import { useResetDataDialog } from '../hooks';
import { DataSection } from './DataSection';
import { ResetDataDialog } from './ResetDataDialog';

/** Data & storage sub-screen: local stats, reset, and its confirmation. */
export const DataPanel = () => {
  const { favorites } = useFavorites();
  const { data, dataUpdatedAt } = useActivities();
  const reset = useResetDataDialog();
  return (
    <>
      <DataSection
        cachedCount={data?.length ?? 0}
        favoritesCount={favorites.length}
        lastSync={dataUpdatedAt}
        onReset={reset.ask}
      />
      <ResetDataDialog
        visible={reset.confirmVisible}
        favoritesCount={favorites.length}
        onConfirm={reset.confirm}
        onKeep={reset.keep}
      />
    </>
  );
};
