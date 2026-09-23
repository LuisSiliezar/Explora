import type { PermissionStatus } from '@domain/entities';
import type { StringKey } from '@presentation/i18n';

const PERMISSION_TEXT: Record<PermissionStatus, StringKey> = {
  granted: 'permGranted',
  denied: 'permDenied',
  prompt: 'permAsk',
};

/** Subtitle of the location permission row. */
export const permissionTextKey = (permission: PermissionStatus): StringKey =>
  PERMISSION_TEXT[permission];

/** Subtitle of the notifications row. */
export const notificationsTextKey = (
  status: PermissionStatus,
  on: boolean,
): StringKey => {
  if (on) {
    return 'notifNote';
  }
  return status === 'prompt' ? 'notifAsk' : 'notifOff';
};

/** Short value on the Settings page's Notifications row. */
export const notificationsValueKey = (
  status: PermissionStatus,
  on: boolean,
): StringKey => {
  if (on) {
    return 'stateOn';
  }
  return status === 'denied' ? 'stateBlocked' : 'stateOff';
};

/** Short value on the Settings page's Location row. */
export const locationValueKey = (permission: PermissionStatus): StringKey =>
  permission === 'granted' ? 'stateOn' : 'stateOff';
