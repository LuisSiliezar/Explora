import type { Activity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import type { FavoritesRepository } from '@domain/repositories';
import type { NotificationPort } from '@domain/services';

interface Deps {
  favorites: FavoritesRepository;
  notifications: NotificationPort;
}

/** Schedules (or replaces) a reminder for an activity. Scheduling implies favoriting. */
export const scheduleReminderUseCase = async (
  { favorites, notifications }: Deps,
  activity: Activity,
  fireAt: Date,
): Promise<string> => {
  if (!(await notifications.requestPermission())) {
    throw new DomainError('PERMISSION_DENIED', 'Notifications are disabled');
  }
  if (!favorites.isFavorite(activity.id)) {
    favorites.add(activity);
  }
  const previous = favorites
    .getAll()
    .find(fav => fav.activity.id === activity.id)?.reminderId;
  if (previous) {
    await notifications.cancel(previous).catch(() => undefined);
  }
  const reminderId = await notifications.scheduleReminder({
    title: activity.title,
    body: `Starting soon at ${activity.location}`,
    fireAt,
  });
  favorites.update(activity.id, { reminderId });
  return reminderId;
};
