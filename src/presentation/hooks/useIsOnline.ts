import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

/** Connectivity from TanStack's onlineManager, which config/query feeds from NetInfo. */
export const useIsOnline = (): boolean =>
  useSyncExternalStore(onlineManager.subscribe.bind(onlineManager), () =>
    onlineManager.isOnline(),
  );
