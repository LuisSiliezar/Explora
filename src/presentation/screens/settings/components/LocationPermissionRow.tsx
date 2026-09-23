import React from 'react';
import { Toggle } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { useLocationPermissionToggle } from '../hooks';
import { permissionTextKey } from '../utils';
import { SettingsRow } from './SettingsRow';

/** Location permission status with a toggle. */
export const LocationPermissionRow = () => {
  const t = useT();
  const { permission, toggle } = useLocationPermissionToggle();
  return (
    <SettingsRow
      title={t('location')}
      subtitle={t(permissionTextKey(permission))}
      className="border-y border-border py-3.5"
    >
      <Toggle
        value={permission === 'granted'}
        onValueChange={toggle}
        accessibilityLabel={t('location')}
      />
    </SettingsRow>
  );
};
