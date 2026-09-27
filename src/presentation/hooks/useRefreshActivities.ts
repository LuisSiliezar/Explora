import { useCallback } from 'react';
import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { refreshActivitiesUseCase } from '@core/use-cases';
import type { Activity } from '@domain/entities';
import { useT } from '@presentation/i18n';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { mutationKeys, queryKeys } from './query-keys';
import { useIsOnline } from './useIsOnline';
import { useToast } from './useToast';

/** Appends `item` unless a newer read already has it (late results never duplicate). */
const appendOnce = (current: Activity[] | undefined, item: Activity) =>
  !current || current.some(activity => activity.id === item.id)
    ? current
    : [...current, item];

/**
 * Pull to refresh (Browse and Search): adds one new activity. Refuses offline, ignores a second pull while one
 * is running, and a failure adds nothing (the cached list stays on screen).
 * The callbacks live on the mutation, not the component, so leaving the screen or
 * backgrounding the app mid-request still applies the result exactly once.
 */
export const useRefreshActivities = () => {
  const t = useT();
  const toast = useToast();
  const online = useIsOnline();
  const queryClient = useQueryClient();
  const { activities, haptics } = useDependencies();
  const refreshing =
    useIsMutating({ mutationKey: mutationKeys.refreshActivities }) > 0;

  const { mutate } = useMutation({
    mutationKey: mutationKeys.refreshActivities,
    mutationFn: () => refreshActivitiesUseCase(activities),
    onSuccess: item => {
      queryClient.setQueryData<Activity[]>(queryKeys.activities, current =>
        appendOnce(current, item),
      );
      haptics.success();
      toast.success(t('toastAdded', { s: item.title }));
    },
    onError: () => {
      haptics.warning();
      toast.error(t('toastRefreshFailed'));
    },
  });

  const onRefresh = useCallback(() => {
    if (!online) {
      haptics.warning();
      toast.warning(t('toastCantRefresh'));
      return;
    }
    if (
      queryClient.isMutating({ mutationKey: mutationKeys.refreshActivities }) >
      0
    ) {
      return; // one refresh at a time: a double pull must not add two items
    }
    mutate();
  }, [online, haptics, toast, t, queryClient, mutate]);

  return { refreshing, onRefresh };
};
