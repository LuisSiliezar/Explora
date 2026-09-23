import { useCallback, useState } from 'react';
import { useDependencies, useIsOnline, useToast } from '@presentation/hooks';
import { useT } from '@presentation/i18n';

/** Pull to refresh: refuses offline with a toast, otherwise refetches and confirms. */
export const useRefreshActivities = (refetch: () => Promise<unknown>) => {
  const t = useT();
  const toast = useToast();
  const online = useIsOnline();
  const { haptics } = useDependencies();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!online) {
      haptics.warning();
      toast.warning(t('toastCantRefresh'));
      return;
    }
    setRefreshing(true);
    try {
      await refetch();
      toast.success(t('toastUpdated'));
    } finally {
      setRefreshing(false);
    }
  }, [online, haptics, toast, t, refetch]);

  return { refreshing, onRefresh };
};
