import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { KeyValueStorage } from '@config/adapters/storage';
import type {
  ColorSchemePreference,
  Language,
  NotificationPreferences,
  PermissionStatus,
  TextScale,
} from '@domain/entities';

export interface AppSettings {
  onboardingDone: boolean;
  language: Language;
  textScale: TextScale;
  colorScheme: ColorSchemePreference;
  /** The user asked to sort by distance (only honoured while location is granted). */
  nearMe: boolean;
  locationPermission: PermissionStatus;
  notifications: NotificationPreferences;
}

export interface AppSettingsState extends AppSettings {
  completeOnboarding: () => void;
  setLanguage: (language: Language) => void;
  setTextScale: (textScale: TextScale) => void;
  setColorScheme: (colorScheme: ColorSchemePreference) => void;
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
  colorScheme: 'system',
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
        setColorScheme: colorScheme => set({ colorScheme }),
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
        version: 3,
        // v1 also stored a local sign-in `account`, v2 a list/grid `layout`. Drop them, keep the rest.
        migrate: persisted => {
          const settings = {
            ...(persisted as AppSettings & {
              account?: unknown;
              layout?: unknown;
            }),
          };
          delete settings.account;
          delete settings.layout;
          return settings;
        },
        storage: createJSONStorage(() => storage),
        partialize: ({
          onboardingDone,
          language,
          textScale,
          colorScheme,
          nearMe,
          locationPermission,
          notifications,
        }): AppSettings => ({
          onboardingDone,
          language,
          textScale,
          colorScheme,
          nearMe,
          locationPermission,
          notifications,
        }),
      },
    ),
  );

export type AppSettingsStore = ReturnType<typeof createAppSettingsStore>;
