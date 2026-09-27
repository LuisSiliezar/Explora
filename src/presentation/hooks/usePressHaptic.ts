import { useCallback, useLayoutEffect, useRef } from 'react';
import { useDependencies } from '@presentation/providers/DependenciesProvider';

/** Which tick a pressable gives. `none` opts out (the handler already gives feedback). */
export type PressHaptic = 'selection' | 'success' | 'warning' | 'none';

/**
 * Wraps a press handler so it fires a haptic first.
 * The returned callback is stable, so memo'd rows don't re-render.
 */
export const usePressHaptic = <A extends unknown[]>(
  kind: PressHaptic,
  handler: (...args: A) => void,
) => {
  const { haptics } = useDependencies();
  const latest = useRef({ kind, handler });
  useLayoutEffect(() => {
    latest.current = { kind, handler };
  });

  return useCallback(
    (...args: A) => {
      const current = latest.current;
      if (current.kind !== 'none') {
        haptics[current.kind]();
      }
      current.handler(...args);
    },
    [haptics],
  );
};
