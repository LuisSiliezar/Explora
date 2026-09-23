import type { FavoritesRepository } from '@domain/repositories';
import type { NotificationPort } from '@domain/services';
import { toggleFavoriteUseCase } from './toggle-favorite.use-case';

interface Deps {
  favorites: FavoritesRepository;
  notifications: NotificationPort;
  resetFilters: () => void;
}

/** "Reset local data": removes every favorite (cancelling reminders) and clears filters. */
export const resetLocalDataUseCase = async (deps: Deps): Promise<void> => {
  const all = deps.favorites.getAll();
  deps.resetFilters();
  await Promise.all(all.map(fav => toggleFavoriteUseCase(deps, fav.activity)));
};
