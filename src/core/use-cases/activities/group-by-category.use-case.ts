import type { ActivityCategory } from '@domain/entities';
import type { ActivityWithDistance } from './sort-activities.use-case';

export interface CategorySection {
  category: ActivityCategory;
  rows: ActivityWithDistance[];
}

/**
 * One section per category, in the same (alphabetical) order as `getCategories`. Rows keep their
 * incoming order, so a by-title or by-distance sort carries into every section. No empty sections.
 */
export const groupByCategory = (
  rows: readonly ActivityWithDistance[],
): CategorySection[] => {
  const byCategory = new Map<ActivityCategory, ActivityWithDistance[]>();
  for (const row of rows) {
    const bucket = byCategory.get(row.activity.category);
    if (bucket) {
      bucket.push(row);
    } else {
      byCategory.set(row.activity.category, [row]);
    }
  }
  return [...byCategory.keys()]
    .sort()
    .map(category => ({ category, rows: byCategory.get(category)! }));
};
