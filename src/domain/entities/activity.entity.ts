import type { Coordinates } from './geo';

export type ActivityCategory = 'Outdoors' | 'Culture' | 'Workshops' | 'Leisure';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  location: string;
  durationMinutes: number;
  /** Optional: sources without coordinates still work, they just can't be sorted by distance. */
  coordinates?: Coordinates;
  /** Precomputed lowercase haystack so search stays O(n) with no per-keystroke allocations. */
  searchText: string;
}
