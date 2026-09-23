import type { Activity } from './activity.entity';

/**
 * A favorite stores a full snapshot of the activity so it can be rendered
 * offline, even if the source (JSON today, API tomorrow) is unavailable.
 */
export interface Favorite {
  activity: Activity;
  savedAt: number;
  photoUri?: string;
  reminderId?: string;
}
