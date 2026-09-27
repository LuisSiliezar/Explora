import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { resetLocalDataUseCase } from '@core/use-cases';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { queryKeys } from './query-keys';

export const useResetLocalData = () => {
  const { activities, favorites, notifications, filterStore, logger } =
    useDependencies();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await resetLocalDataUseCase({
      favorites,
      notifications,
      logger,
      resetFilters: filterStore.getState().reset,
      clearAddedActivities: () => activities.clearAdded(),
    });
    await queryClient.resetQueries({ queryKey: queryKeys.activities });
  }, [activities, favorites, notifications, filterStore, logger, queryClient]);
};
