import { useQuery } from '@tanstack/react-query';
import { getActivitiesUseCase } from '@core/use-cases';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { queryKeys } from './query-keys';

export const useActivities = () => {
  const { activities } = useDependencies();
  return useQuery({
    queryKey: queryKeys.activities,
    queryFn: ({ signal }) => getActivitiesUseCase(activities, signal),
  });
};
