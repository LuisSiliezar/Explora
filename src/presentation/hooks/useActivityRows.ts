import { useMemo } from 'react';
import type { Activity, Coordinates } from '@domain/entities';
import {
  sortByDistance,
  sortByTitle,
  type ActivityWithDistance,
} from '@core/use-cases';

/** Nearest first when we have an origin, alphabetical otherwise (as in the design). */
export const useActivityRows = (
  activities: readonly Activity[],
  origin?: Coordinates,
): ActivityWithDistance[] =>
  useMemo(
    () =>
      origin ? sortByDistance(activities, origin) : sortByTitle(activities),
    [activities, origin],
  );
