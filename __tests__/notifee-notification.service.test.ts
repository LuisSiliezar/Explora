import notifee, { AndroidImportance } from '@notifee/react-native';
import { NotifeeNotificationService } from '@infrastructure/services';
import { createFakeLogger } from './helpers/fakes';

describe('NotifeeNotificationService', () => {
  it('schedules reminders on a high-importance channel so Android shows a banner', async () => {
    await new NotifeeNotificationService(createFakeLogger()).scheduleReminder({
      activityId: 'act-001',
      title: 'Walk',
      body: 'Starting soon',
      fireAt: new Date(Date.now() + 60_000),
    });

    expect(notifee.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'activity-reminders',
        importance: AndroidImportance.HIGH,
      }),
    );
    expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { activityId: 'act-001' },
        android: expect.objectContaining({ channelId: 'activity-reminders' }),
      }),
      expect.anything(),
    );
  });
});
