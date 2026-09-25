import type { FavoritesRepository } from '@domain/repositories';
import type { NotificationPort } from '@domain/services';
import { toggleFavoriteUseCase } from './toggle-favorite.use-case';

interface Deps {
  favorites: FavoritesRepository;
  notifications: NotificationPort;
  resetFilters: () => void;
  /** Drops the activities added by refresh. */
  clearAddedActivities: () => void;
}

/**
 * "Reset local data": removes every favorite (cancelling reminders), the activities
 * added by refresh, and the filters.
 */
export const resetLocalDataUseCase = async (deps: Deps): Promise<void> => {
  const all = deps.favorites.getAll();
  deps.resetFilters();
  deps.clearAddedActivities();
  await Promise.all(all.map(fav => toggleFavoriteUseCase(deps, fav.activity)));
};
