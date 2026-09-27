import { useMemo } from 'react';
import type { ActivityWithDistance } from '@core/use-cases';
import { useFavorites } from '@presentation/hooks';

/** Saved favorites as list rows (no distance: this screen never sorts by location). */
export const useFavoriteRows = (): ActivityWithDistance[] => {
  const { favorites } = useFavorites();
  return useMemo(
    () => favorites.map(fav => ({ activity: fav.activity, distanceKm: null })),
    [favorites],
  );
};
