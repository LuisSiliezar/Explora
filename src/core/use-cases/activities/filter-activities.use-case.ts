import type {
  Activity,
  ActivityCategory,
  ActivityFilter,
  DurationFilter,
} from '@domain/entities';

const matchesDuration = (
  minutes: number,
  duration: DurationFilter,
): boolean => {
  switch (duration) {
    case 'short':
      return minutes < 60;
    case 'mid':
      return minutes >= 60 && minutes <= 120;
    case 'long':
      return minutes > 120;
  }
};

/** Pure and allocation-light: one pass, no regex, matches against precomputed `searchText`. */
export const filterActivities = (
  activities: readonly Activity[],
  { query, categories, duration }: ActivityFilter,
): Activity[] => {
  const needle = query.trim().toLowerCase();
  if (!needle && categories.length === 0 && !duration) {
    return activities as Activity[];
  }
  return activities.filter(
    activity =>
      (categories.length === 0 || categories.includes(activity.category)) &&
      (!duration || matchesDuration(activity.durationMinutes, duration)) &&
      (!needle || activity.searchText.includes(needle)),
  );
};

/** Number of active filters, excluding the text query (shown as "N FILTERS"). */
export const countActiveFilters = ({
  categories,
  duration,
}: ActivityFilter): number => categories.length + (duration ? 1 : 0);

export const getCategories = (
  activities: readonly Activity[],
): ActivityCategory[] =>
  [...new Set(activities.map(activity => activity.category))].sort();
