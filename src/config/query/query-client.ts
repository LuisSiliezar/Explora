import { AppState, Platform, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { isDomainError } from '@domain/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      // Don't retry errors that won't fix themselves.
      retry: (failureCount, error) =>
        failureCount < 2 &&
        !(
          isDomainError(error) &&
          ['NOT_FOUND', 'VALIDATION'].includes(error.code)
        ),
    },
  },
});

/** Wires RN lifecycle into TanStack Query. Returns an unsubscribe function. */
export const setupQueryLifecycle = (): (() => void) => {
  onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(state => setOnline(!!state.isConnected)),
  );

  const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(status === 'active');
    }
  };
  const subscription = AppState.addEventListener('change', onAppStateChange);
  return () => subscription.remove();
};
