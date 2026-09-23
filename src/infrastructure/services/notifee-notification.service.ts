import notifee, {
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';
import type { NotificationPort, ReminderRequest } from '@domain/services';

const CHANNEL_ID = 'reminders';

export class NotifeeNotificationService implements NotificationPort {
  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  async scheduleReminder({
    title,
    body,
    fireAt,
  }: ReminderRequest): Promise<string> {
    const channelId = await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Activity reminders',
    });
    return notifee.createTriggerNotification(
      { title, body, android: { channelId, pressAction: { id: 'default' } } },
      { type: TriggerType.TIMESTAMP, timestamp: fireAt.getTime() },
    );
  }

  cancel(id: string): Promise<void> {
    return notifee.cancelNotification(id);
  }
}
