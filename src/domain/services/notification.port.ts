export interface ReminderRequest {
  /** Carried in the notification so a tap can open the activity. */
  activityId: string;
  title: string;
  body: string;
  fireAt: Date;
}

export interface NotificationPort {
  requestPermission(): Promise<boolean>;
  /** Returns the id needed to cancel the reminder. */
  scheduleReminder(request: ReminderRequest): Promise<string>;
  cancel(id: string): Promise<void>;
  /** Activity id of the reminder whose tap launched the app, or null. */
  getInitialOpenedActivity(): Promise<string | null>;
  /** Called with the activity id when the user taps a reminder while the app is alive. */
  onReminderOpened(listener: (activityId: string) => void): () => void;
}
