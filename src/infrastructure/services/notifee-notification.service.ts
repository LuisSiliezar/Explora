import { AppState } from 'react-native';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  TriggerType,
  type Notification,
} from '@notifee/react-native';
import type {
  LoggerPort,
  NotificationPort,
  ReminderRequest,
} from '@domain/services';

/**
 * HIGH importance makes the reminder pop up as a heads-up banner. Android fixes a
 * channel's importance when it is first created, so this replaced the old `reminders`
 * channel (default importance) instead of editing it. The old one is not deleted:
 * Android drops notifications already scheduled on a deleted channel.
 */
const CHANNEL_ID = 'activity-reminders';

const activityIdOf = (notification?: Notification): string | null => {
  const id = notification?.data?.activityId;
  return typeof id === 'string' ? id : null;
};

/**
 * notifee requires a background handler on Android. Taps are handled once the app is
 * in front (getInitialNotification / foreground PRESS), so there is nothing to do here.
 * Call it once from index.js, before registering the app.
 */
export const registerNotificationBackgroundHandler = (): void =>
  notifee.onBackgroundEvent(async () => undefined);

export class NotifeeNotificationService implements NotificationPort {
  /** Notification ids already turned into navigation, so a tap never opens twice. */
  private readonly handled = new Set<string>();

  constructor(private readonly logger: LoggerPort) {}

  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  async scheduleReminder({
    activityId,
    title,
    body,
    fireAt,
  }: ReminderRequest): Promise<string> {
    const channelId = await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Activity reminders',
      importance: AndroidImportance.HIGH,
    });
    return notifee.createTriggerNotification(
      {
        title,
        body,
        data: { activityId },
        android: {
          channelId,
          pressAction: { id: 'default', launchActivity: 'default' },
        },
        // Show the banner even when the app is open.
        ios: {
          foregroundPresentationOptions: {
            banner: true,
            list: true,
            sound: true,
          },
        },
      },
      { type: TriggerType.TIMESTAMP, timestamp: fireAt.getTime() },
    );
  }

  cancel(id: string): Promise<void> {
    return notifee.cancelNotification(id);
  }

  async getInitialOpenedActivity(): Promise<string | null> {
    const initial = await notifee.getInitialNotification();
    return this.claim(initial?.notification);
  }

  onReminderOpened(listener: (activityId: string) => void): () => void {
    const emit = (notification?: Notification) => {
      const activityId = this.claim(notification);
      if (activityId) {
        listener(activityId);
      }
    };
    const unsubscribeEvents = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        emit(detail.notification);
      }
    });
    // Android: a tap while the app is in background resumes the activity with the
    // notification intent instead of firing a foreground PRESS.
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') {
        notifee
          .getInitialNotification()
          .then(initial => emit(initial?.notification))
          .catch(error =>
            this.logger.warn('Reading the opening notification failed', {
              error,
            }),
          );
      }
    });
    return () => {
      unsubscribeEvents();
      appState.remove();
    };
  }

  private claim(notification?: Notification): string | null {
    const activityId = activityIdOf(notification);
    const key = notification?.id;
    if (!activityId || !key || this.handled.has(key)) {
      return null;
    }
    this.handled.add(key);
    return activityId;
  }
}
