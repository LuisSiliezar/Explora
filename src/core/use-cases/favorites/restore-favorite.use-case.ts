import type { Favorite } from '@domain/entities';
import type { FavoritesRepository } from '@domain/repositories';

interface Deps {
  favorites: FavoritesRepository;
}

/**
 * Undo for a removal: puts the snapshot back with its photo.
 * The reminder was cancelled on removal, so it is not restored.
 */
export const restoreFavoriteUseCase = (
  { favorites }: Deps,
  favorite: Favorite,
): void => {
  if (favorites.isFavorite(favorite.activity.id)) {
    return;
  }
  favorites.add(favorite.activity);
  favorites.update(favorite.activity.id, {
    savedAt: favorite.savedAt,
    photoUri: favorite.photoUri,
  });
};
