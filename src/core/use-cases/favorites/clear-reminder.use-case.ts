import type { FavoritesRepository } from '@domain/repositories';

interface Deps {
  favorites: FavoritesRepository;
}

/** An opened reminder is done: forget its id so the detail screen offers a new one. */
export const clearReminderUseCase = (
  { favorites }: Deps,
  activityId: string,
): void => {
  const favorite = favorites
    .getAll()
    .find(fav => fav.activity.id === activityId);
  if (favorite?.reminderId) {
    favorites.update(activityId, { reminderId: undefined });
  }
};
