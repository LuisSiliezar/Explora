import { useMemo } from 'react';
import { toast } from 'sonner-native';

/**
 * The only place screens reach the toast library (swap it here without touching UI).
 * Pick the variant by outcome: its dot color tells the user what happened.
 */
export const useToast = () =>
  useMemo(
    () => ({
      /** Neutral feedback (a sort changed, a setting was turned off). */
      info: (message: string) => toast.info(message),
      /** Something the user asked for worked. */
      success: (message: string) => toast.success(message),
      /** It didn't fail, but the user is limited (offline, permission needed). */
      warning: (message: string) => toast.warning(message),
      /** The action failed. */
      error: (message: string) => toast.error(message),
      /** A neutral toast with an inline action, e.g. Undo. */
      withAction: (message: string, label: string, onPress: () => void) =>
        toast.info(message, {
          action: { label, onClick: onPress },
          duration: 4000,
        }),
    }),
    [],
  );
