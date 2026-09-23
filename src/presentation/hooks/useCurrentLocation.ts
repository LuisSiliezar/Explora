import { queryOptions, useQuery } from '@tanstack/react-query';
import type { LocationPort } from '@domain/services';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { queryKeys } from './query-keys';

export const currentLocationQuery = (location: LocationPort) =>
  queryOptions({
    queryKey: queryKeys.currentPosition,
    queryFn: () => location.getCurrentPosition(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    networkMode: 'always', // GPS works offline
  });

/** Device position as async data (cached 5 min). Only runs while `enabled`. */
export const useCurrentLocation = (enabled: boolean) => {
  const { location } = useDependencies();
  return useQuery({ ...currentLocationQuery(location), enabled });
};
