export type Language = 'en' | 'es';
export type TextScale = 0.92 | 1 | 1.12;
/** 'system' follows the device's light/dark setting. */
export type ColorSchemePreference = 'system' | 'light' | 'dark';
/** 'prompt' means the app hasn't asked yet. */
export type PermissionStatus = 'prompt' | 'granted' | 'denied';

export interface NotificationPreferences {
  status: PermissionStatus;
  /** Weekly "new activities" summary (stored preference; nothing schedules it yet). */
  weekly: boolean;
  /** Reminders for saved activities. */
  reminders: boolean;
}

/** Dev/staging only: how the simulated network answers catalog and refresh requests. */
export type NetworkSimulation = 'normal' | 'slow' | 'fail';
