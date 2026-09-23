import { useCallback } from 'react';
import { onlineManager } from '@tanstack/react-query';
import type { Credentials } from '@domain/entities';
import { signInUseCase } from '@core/use-cases';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { useSettings } from './useSettings';

export const useAccount = () => {
  const { settingsStore } = useDependencies();
  const account = useSettings(state => state.account);

  const signIn = useCallback(
    (credentials: Credentials) =>
      signInUseCase(
        {
          isOnline: () => onlineManager.isOnline(),
          saveAccount: settingsStore.getState().setAccount,
        },
        credentials,
      ),
    [settingsStore],
  );
  const signOut = useCallback(
    () => settingsStore.getState().setAccount(null),
    [settingsStore],
  );

  return { account, signIn, signOut };
};
