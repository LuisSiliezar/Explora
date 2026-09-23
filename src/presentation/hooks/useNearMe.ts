import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useT } from '@presentation/i18n/useT';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { currentLocationQuery, useCurrentLocation } from './useCurrentLocation';
import { useSettings } from './useSettings';
import { useToast } from './useToast';

/**
 * "Near me" flow from the design: an in-app pre-prompt, then the OS prompt, then locating.
 * Denying never blocks the app: activities fall back to alphabetical order.
 */
export const useNearMe = () => {
  const { settingsStore, location, haptics } = useDependencies();
  const queryClient = useQueryClient();
  const t = useT();
  const toast = useToast();
  const nearMe = useSettings(state => state.nearMe);
  const permission = useSettings(state => state.locationPermission);
  const [promptVisible, setPromptVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const active = nearMe && permission === 'granted';
  const position = useCurrentLocation(active);
  const { setNearMe, setLocationPermission } = settingsStore.getState();

  const locate = useCallback(async () => {
    try {
      await queryClient.fetchQuery(currentLocationQuery(location));
      settingsStore.getState().setNearMe(true);
      haptics.success();
      toast.success(t('toastLocOn'));
    } catch {
      settingsStore.getState().setNearMe(false);
      haptics.warning();
      toast.error(t('toastLocFailed'));
    }
  }, [queryClient, location, settingsStore, haptics, toast, t]);

  const allow = useCallback(async () => {
    setPromptVisible(false);
    setRequesting(true);
    try {
      const granted = await location.requestPermission();
      setLocationPermission(granted ? 'granted' : 'denied');
      if (granted) {
        await locate();
      } else {
        haptics.warning();
        setBannerDismissed(false);
      }
    } finally {
      setRequesting(false);
    }
  }, [location, setLocationPermission, locate, haptics]);

  const onPressNearMe = useCallback(() => {
    if (permission === 'granted') {
      const next = !nearMe;
      if (
        next &&
        !queryClient.getQueryData(currentLocationQuery(location).queryKey)
      ) {
        setRequesting(true);
        locate().finally(() => setRequesting(false));
        return;
      }
      setNearMe(next);
      toast.info(t(next ? 'toastSortedDist' : 'toastSortedAlpha'));
      return;
    }
    if (permission === 'denied') {
      // Ask the OS again: the user may have turned location on in device settings.
      // Still denied -> the banner comes back.
      allow();
      return;
    }
    setPromptVisible(true);
  }, [
    permission,
    nearMe,
    queryClient,
    location,
    locate,
    setNearMe,
    toast,
    t,
    allow,
  ]);

  const deny = useCallback(() => {
    setPromptVisible(false);
    setLocationPermission('denied');
    setBannerDismissed(false);
  }, [setLocationPermission]);

  const cancel = useCallback(() => {
    setPromptVisible(false);
    toast.info(t('toastLocCancelled'));
  }, [toast, t]);

  return {
    active,
    permission,
    origin: active ? position.data : undefined,
    locating: requesting || (active && position.isFetching && !position.data),
    promptVisible,
    allow,
    deny,
    cancel,
    onPressNearMe,
    bannerVisible: permission === 'denied' && !bannerDismissed,
    dismissBanner: useCallback(() => setBannerDismissed(true), []),
  };
};
