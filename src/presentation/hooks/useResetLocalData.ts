import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { resetLocalDataUseCase } from '@core/use-cases';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { queryKeys } from './query-keys';

export const useResetLocalData = () => {
  const { favorites, notifications, filterStore } = useDependencies();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await resetLocalDataUseCase({
      favorites,
      notifications,
      resetFilters: filterStore.getState().reset,
    });
    await queryClient.resetQueries({ queryKey: queryKeys.activities });
  }, [favorites, notifications, filterStore, queryClient]);
};
