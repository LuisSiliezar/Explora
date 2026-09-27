import { useEffect, useRef } from 'react';
import { useT } from '@presentation/i18n';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { useIsOnline } from './useIsOnline';
import { useToast } from './useToast';

/** Tells the user when connectivity changes. Silent on launch: the banner covers that. */
export const useConnectivityToast = () => {
  const online = useIsOnline();
  const previous = useRef(online);
  const { haptics } = useDependencies();
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    if (previous.current === online) {
      return;
    }
    previous.current = online;
    if (online) {
      toast.success(t('toastOnline'));
    } else {
      haptics.warning();
      toast.warning(t('toastOffline'));
    }
  }, [online, haptics, toast, t]);
};
