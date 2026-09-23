import type { Activity, Coordinates } from '@domain/entities';

export interface ActivityWithDistance {
  activity: Activity;
  /** null when the activity has no coordinates. */
  distanceKm: number | null;
}

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance (haversine), in kilometres. */
export const distanceKm = (from: Coordinates, to: Coordinates): number => {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

/** Nearest first. Activities without coordinates keep their order, at the end. */
export const sortByDistance = (
  activities: readonly Activity[],
  origin: Coordinates,
): ActivityWithDistance[] =>
  activities
    .map(activity => ({
      activity,
      distanceKm: activity.coordinates
        ? distanceKm(origin, activity.coordinates)
        : null,
    }))
    .sort((a, b) => {
      if (a.distanceKm === null) {
        return b.distanceKm === null ? 0 : 1;
      }
      return b.distanceKm === null ? -1 : a.distanceKm - b.distanceKm;
    });

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

/** Alphabetical by title, the default order when not sorting by distance. */
export const sortByTitle = (
  activities: readonly Activity[],
): ActivityWithDistance[] =>
  activities
    .map(activity => ({ activity, distanceKm: null }))
    .sort((a, b) => collator.compare(a.activity.title, b.activity.title));
