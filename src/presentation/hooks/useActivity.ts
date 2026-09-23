import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Activity } from '@domain/entities';
import { getActivityByIdUseCase } from '@core/use-cases';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { queryKeys } from './query-keys';

export const useActivity = (id: string) => {
  const { activities, favorites } = useDependencies();
  const queryClient = useQueryClient();

  return useQuery<Activity>({
    queryKey: queryKeys.activity(id),
    queryFn: ({ signal }) => getActivityByIdUseCase(activities, id, signal),
    // Instant render from the list cache or an offline favorite snapshot.
    placeholderData: (): Activity | undefined =>
      queryClient
        .getQueryData<Activity[]>(queryKeys.activities)
        ?.find(item => item.id === id) ??
      favorites.getAll().find(fav => fav.activity.id === id)?.activity,
  });
};
