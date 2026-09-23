import { distanceKm } from '@core/use-cases';
import type { Activity, Coordinates } from '@domain/entities';
import { isDomainError } from '@domain/errors';
import type { StringKey } from '@presentation/i18n';

/** Toast copy for a failed reminder or photo action. */
export const errorToastKey = (error: unknown): StringKey =>
  isDomainError(error) && error.code === 'PERMISSION_DENIED'
    ? 'toastPermissionNeeded'
    : 'toastSomethingWrong';

/** Distance in km from the user, or null without a location on either side. */
export const distanceTo = (
  origin: Coordinates | undefined,
  activity: Activity,
): number | null =>
  origin && activity.coordinates
    ? distanceKm(origin, activity.coordinates)
    : null;
