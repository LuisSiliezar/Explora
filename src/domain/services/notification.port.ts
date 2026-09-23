export interface ReminderRequest {
  title: string;
  body: string;
  fireAt: Date;
}

export interface NotificationPort {
  requestPermission(): Promise<boolean>;
  /** Returns the id needed to cancel the reminder. */
  scheduleReminder(request: ReminderRequest): Promise<string>;
  cancel(id: string): Promise<void>;
}
