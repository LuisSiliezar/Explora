import type { Activity } from '@domain/entities';
import type { FavoritesRepository } from '@domain/repositories';
import type { LoggerPort, NotificationPort } from '@domain/services';

interface Deps {
  favorites: FavoritesRepository;
  notifications: NotificationPort;
  logger: LoggerPort;
}

/** Returns the new favorite state. Removing a favorite also cancels its reminder. */
export const toggleFavoriteUseCase = async (
  { favorites, notifications, logger }: Deps,
  activity: Activity,
): Promise<boolean> => {
  if (!favorites.isFavorite(activity.id)) {
    favorites.add(activity);
    return true;
  }
  const reminderId = favorites
    .getAll()
    .find(fav => fav.activity.id === activity.id)?.reminderId;
  favorites.remove(activity.id); // local change first: the UI never waits on native calls
  if (reminderId) {
    await notifications
      .cancel(reminderId)
      .catch(error =>
        logger.warn('Cancelling a reminder failed', { reminderId, error }),
      );
  }
  return false;
};
