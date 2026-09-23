import { useMemo } from 'react';
import { toast } from 'sonner-native';

/** The only place screens reach the toast library (swap it here without touching UI). */
export const useToast = () =>
  useMemo(
    () => ({
      show: (message: string) => toast(message),
      /** A toast with an inline action, e.g. Undo. */
      withAction: (message: string, label: string, onPress: () => void) =>
        toast(message, { action: { label, onClick: onPress }, duration: 4000 }),
    }),
    [],
  );
