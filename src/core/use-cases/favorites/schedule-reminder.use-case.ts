import type { Activity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import type { FavoritesRepository } from '@domain/repositories';
import type { LoggerPort, NotificationPort } from '@domain/services';

/** Localized by the caller: core has no i18n. */
interface ReminderCopy {
  title: string;
  body: string;
}

interface Deps {
  favorites: FavoritesRepository;
  notifications: NotificationPort;
  logger: LoggerPort;
}

/** Schedules (or replaces) a reminder for an activity. Scheduling implies favoriting. */
export const scheduleReminderUseCase = async (
  { favorites, notifications, logger }: Deps,
  activity: Activity,
  fireAt: Date,
  copy: ReminderCopy,
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
    await notifications.cancel(previous).catch(error =>
      logger.warn('Cancelling the previous reminder failed', {
        reminderId: previous,
        error,
      }),
    );
  }
  const reminderId = await notifications.scheduleReminder({
    activityId: activity.id,
    ...copy,
    fireAt,
  });
  favorites.update(activity.id, { reminderId });
  return reminderId;
};
