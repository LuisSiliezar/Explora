import type { PermissionStatus } from '@domain/entities';
import type { StringKey } from '@presentation/i18n';

/** Status dot on the "Near me" chip: on, off, or greyed out when location is denied. */
export const nearMeDot = (
  active: boolean,
  permission: PermissionStatus,
): 'on' | 'off' | 'disabled' => {
  if (active) {
    return 'on';
  }
  return permission === 'denied' ? 'disabled' : 'off';
};

/** Singular or plural noun for the header count. */
export const countLabelKey = (count: number): StringKey =>
  count === 1 ? 'activityCount' : 'activitiesCount';
