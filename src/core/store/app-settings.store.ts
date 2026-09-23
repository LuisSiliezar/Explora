import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { KeyValueStorage } from '@config/adapters/storage';
import type {
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
}

export interface AppSettingsState extends AppSettings {
  completeOnboarding: () => void;
  setLanguage: (language: Language) => void;
  setTextScale: (textScale: TextScale) => void;
  setLayout: (layout: ListLayout) => void;
  setNearMe: (nearMe: boolean) => void;
  setLocationPermission: (status: PermissionStatus) => void;
  setNotifications: (patch: Partial<NotificationPreferences>) => void;
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
});

/**
 * Persisted app preferences. Writes are synchronous (MMKV),
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
      }),
      {
        name: 'app-settings:v1',
        version: 2,
        // v1 also stored a local sign-in `account`. Drop it, keep everything else.
        migrate: persisted => {
          const settings = {
            ...(persisted as AppSettings & { account?: unknown }),
          };
          delete settings.account;
          return settings;
        },
        storage: createJSONStorage(() => storage),
        partialize: ({
          onboardingDone,
          language,
          textScale,
          layout,
          nearMe,
          locationPermission,
          notifications,
        }): AppSettings => ({
          onboardingDone,
          language,
          textScale,
          layout,
          nearMe,
          locationPermission,
          notifications,
        }),
      },
    ),
  );

export type AppSettingsStore = ReturnType<typeof createAppSettingsStore>;
