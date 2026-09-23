export type Language = 'en' | 'es';
export type TextScale = 0.92 | 1 | 1.12;
export type ListLayout = 'list' | 'grid';
/** 'prompt' means the app hasn't asked yet. */
export type PermissionStatus = 'prompt' | 'granted' | 'denied';

export interface NotificationPreferences {
  status: PermissionStatus;
  /** Weekly "new activities" summary (stored preference; nothing schedules it yet). */
  weekly: boolean;
  /** Reminders for saved activities. */
  reminders: boolean;
}
