import { useMemo } from 'react';
import { AccessibilityInfo } from 'react-native';
import { toast } from 'sonner-native';

/** Toasts are visual only: announce them so VoiceOver/TalkBack users hear the outcome too. */
const announced =
  <A extends unknown[]>(show: (message: string, ...rest: A) => unknown) =>
  (message: string, ...rest: A) => {
    AccessibilityInfo.announceForAccessibility(message);
    show(message, ...rest);
  };

/**
 * The only place screens reach the toast library (swap it here without touching UI).
 * Pick the variant by outcome: its dot color tells the user what happened.
 */
export const useToast = () =>
  useMemo(
    () => ({
      /** Neutral feedback (a sort changed, a setting was turned off). */
      info: announced(toast.info),
      /** Something the user asked for worked. */
      success: announced(toast.success),
      /** It didn't fail, but the user is limited (offline, permission needed). */
      warning: announced(toast.warning),
      /** The action failed. */
      error: announced(toast.error),
      /** A neutral toast with an inline action, e.g. Undo. */
      withAction: announced(
        (message: string, label: string, onPress: () => void) =>
          toast.info(message, {
            action: { label, onClick: onPress },
            duration: 4000,
          }),
      ),
    }),
    [],
  );
