import { useCallback } from 'react';
import type { Activity } from '@domain/entities';
import { useIsFavorite } from '@presentation/hooks/useFavorites';
import { usePressHaptic } from '@presentation/hooks/usePressHaptic';
import { useT } from '@presentation/i18n/useT';

/**
 * Stable press/toggle handlers bound to one activity, plus its favorite flag.
 * Subscribes only to this row's flag, so 1000+ rows stay cheap.
 */
export const useActivityCardHandlers = (
  activity: Activity,
  onPress: (activity: Activity) => void,
  onToggleFavorite: (activity: Activity) => void,
) => {
  const t = useT();
  const isFavorite = useIsFavorite(activity.id);
  const open = useCallback(() => onPress(activity), [activity, onPress]);
  const handlePress = usePressHaptic('selection', open);
  const handleToggle = useCallback(
    () => onToggleFavorite(activity),
    [activity, onToggleFavorite],
  );
  const favoriteLabel = t(
    isFavorite ? 'removeFromFavorites' : 'addToFavorites',
    { s: activity.title },
  );
  return { isFavorite, handlePress, handleToggle, favoriteLabel };
};
