import { useCallback, useSyncExternalStore } from 'react';
import type { Activity } from '@domain/entities';
import type { PhotoSource } from '@domain/services';
import {
  attachPhotoUseCase,
  restoreFavoriteUseCase,
  scheduleReminderUseCase,
  toggleFavoriteUseCase,
} from '@core/use-cases';
import { useT } from '@presentation/i18n/useT';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { useToast } from './useToast';

/** Favorites are local-first: reads are synchronous and work fully offline. */
export const useFavorites = () => {
  const deps = useDependencies();
  const { favorites } = deps;
  const list = useSyncExternalStore(favorites.subscribe, favorites.getAll);

  const attachPhoto = useCallback(
    (activity: Activity, source: PhotoSource) =>
      attachPhotoUseCase(deps, activity, source),
    [deps],
  );
  const scheduleReminder = useCallback(
    (activity: Activity, fireAt: Date) =>
      scheduleReminderUseCase(deps, activity, fireAt),
    [deps],
  );

  return { favorites: list, attachPhoto, scheduleReminder };
};

/**
 * Stable toggle with feedback: haptic + toast on save, and an Undo toast on removal
 * (restores the snapshot, photo included).
 */
export const useToggleFavorite = () => {
  const deps = useDependencies();
  const t = useT();
  const toast = useToast();

  return useCallback(
    async (activity: Activity) => {
      const snapshot = deps.favorites
        .getAll()
        .find(fav => fav.activity.id === activity.id);
      const added = await toggleFavoriteUseCase(deps, activity);
      if (added) {
        deps.haptics.success();
        toast.show(t('toastSaved', { s: activity.title }));
        return;
      }
      deps.haptics.selection();
      toast.withAction(
        t('toastRemoved', { s: activity.title }),
        t('undo'),
        () => {
          if (snapshot) {
            restoreFavoriteUseCase(deps, snapshot);
          }
        },
      );
    },
    [deps, t, toast],
  );
};

/** Fine-grained subscription so a list row re-renders only when its own state flips. */
export const useIsFavorite = (activityId: string): boolean => {
  const { favorites } = useDependencies();
  return useSyncExternalStore(favorites.subscribe, () =>
    favorites.isFavorite(activityId),
  );
};

export const useFavorite = (activityId: string) => {
  const { favorites } = useFavorites();
  return favorites.find(fav => fav.activity.id === activityId);
};
