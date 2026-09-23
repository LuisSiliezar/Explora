import { useCallback } from 'react';
import { Linking } from 'react-native';
import { useDependencies, useSettings, useToast } from '@presentation/hooks';
import { useT } from '@presentation/i18n';

/** Settings row: turn off locally, or ask the OS (falling back to device settings). */
export const useLocationPermissionToggle = () => {
  const t = useT();
  const toast = useToast();
  const { settingsStore, location } = useDependencies();
  const permission = useSettings(state => state.locationPermission);

  const toggle = useCallback(async () => {
    const { setLocationPermission } = settingsStore.getState();
    if (permission === 'granted') {
      setLocationPermission('denied');
      return;
    }
    const granted = await location.requestPermission();
    setLocationPermission(granted ? 'granted' : 'denied');
    if (!granted) {
      toast.show(t('toastPermissionNeeded'));
      Linking.openSettings();
    }
  }, [settingsStore, permission, location, toast, t]);

  return { permission, toggle };
};
