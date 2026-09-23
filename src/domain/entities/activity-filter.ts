import type { ActivityCategory } from './activity.entity';

/** short: under 1h · mid: 1–2h · long: over 2h. */
export type DurationFilter = 'short' | 'mid' | 'long';

export interface ActivityFilter {
  query: string;
  /** Empty means every category. */
  categories: ActivityCategory[];
  duration: DurationFilter | null;
}

export const EMPTY_ACTIVITY_FILTER: ActivityFilter = {
  query: '',
  categories: [],
  duration: null,
};
