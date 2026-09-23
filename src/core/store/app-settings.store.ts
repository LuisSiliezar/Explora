import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { KeyValueStorage } from '@config/adapters/storage';
import type {
  Account,
  Language,
  ListLayout,
  NotificationPreferences,
  PermissionStatus,
  TextScale,
} from '@domain/entities';

export interface AppSettings {
  onboardingDone: boolean;
  language: Language;
  textScale: TextScale;
  layout: ListLayout;
  /** The user asked to sort by distance (only honoured while location is granted). */
  nearMe: boolean;
  locationPermission: PermissionStatus;
  notifications: NotificationPreferences;
  account: Account | null;
}

export interface AppSettingsState extends AppSettings {
  completeOnboarding: () => void;
  setLanguage: (language: Language) => void;
  setTextScale: (textScale: TextScale) => void;
  setLayout: (layout: ListLayout) => void;
  setNearMe: (nearMe: boolean) => void;
  setLocationPermission: (status: PermissionStatus) => void;
  setNotifications: (patch: Partial<NotificationPreferences>) => void;
  setAccount: (account: Account | null) => void;
}

export const detectLanguage = (locale?: string): Language => {
  try {
    const tag = locale ?? Intl.DateTimeFormat().resolvedOptions().locale;
    return tag.toLowerCase().startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
};

export const defaultAppSettings = (): AppSettings => ({
  onboardingDone: false,
  language: detectLanguage(),
  textScale: 1,
  layout: 'list',
  nearMe: false,
  locationPermission: 'prompt',
  notifications: { status: 'prompt', weekly: false, reminders: true },
  account: null,
});

/**
 * Persisted app preferences and the local session. Writes are synchronous (MMKV),
 * so nothing is lost if the OS kills the app. Storage is injected (DIP).
 */
export const createAppSettingsStore = (storage: KeyValueStorage) =>
  create<AppSettingsState>()(
    persist(
      set => ({
        ...defaultAppSettings(),
        completeOnboarding: () => set({ onboardingDone: true }),
        setLanguage: language => set({ language }),
        setTextScale: textScale => set({ textScale }),
        setLayout: layout => set({ layout }),
        setNearMe: nearMe => set({ nearMe }),
        setLocationPermission: locationPermission =>
          set(state => ({
            locationPermission,
            nearMe: locationPermission === 'granted' ? state.nearMe : false,
          })),
        setNotifications: patch =>
          set(state => ({
            notifications: { ...state.notifications, ...patch },
          })),
        setAccount: account => set({ account }),
      }),
      {
        name: 'app-settings:v1',
        version: 1,
        storage: createJSONStorage(() => storage),
        partialize: ({
          onboardingDone,
          language,
          textScale,
          layout,
          nearMe,
          locationPermission,
          notifications,
          account,
        }): AppSettings => ({
          onboardingDone,
          language,
          textScale,
          layout,
          nearMe,
          locationPermission,
          notifications,
          account,
        }),
      },
    ),
  );

export type AppSettingsStore = ReturnType<typeof createAppSettingsStore>;
