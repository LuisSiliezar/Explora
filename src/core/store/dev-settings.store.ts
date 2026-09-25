import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { KeyValueStorage } from '@config/adapters/storage';
import type { NetworkSimulation } from '@domain/entities';

export interface DevSettings {
  network: NetworkSimulation;
}

export interface DevSettingsState extends DevSettings {
  setNetwork: (network: NetworkSimulation) => void;
}

/** How long the 'slow' simulation waits: long enough to background the app mid-request. */
export const SIMULATED_SLOW_MS = 4000;

/**
 * Dev/staging-only switches for reviewers (reproduce success, slow and failure).
 * Persisted, so a cold start in 'fail' mode reproduces the error state too.
 */
export const createDevSettingsStore = (storage: KeyValueStorage) =>
  create<DevSettingsState>()(
    persist(
      set => ({
        network: 'normal',
        setNetwork: network => set({ network }),
      }),
      {
        name: 'dev-settings:v1',
        storage: createJSONStorage(() => storage),
        partialize: ({ network }): DevSettings => ({ network }),
      },
    ),
  );

export type DevSettingsStore = ReturnType<typeof createDevSettingsStore>;
