import type { Activity } from '@domain/entities';

/** Screen-reader summary of a card: title, category, duration, location. */
export const activityA11yLabel = (activity: Activity): string =>
  `${activity.title}, ${activity.category}, ${activity.durationMinutes} min, ${activity.location}`;
