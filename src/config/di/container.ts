import { AxiosAdapter } from '@config/adapters/http';
import {
  MMKVStorageAdapter,
  type KeyValueStorage,
} from '@config/adapters/storage';
import { env } from '@config/env';
import {
  createActivityFilterStore,
  createAppSettingsStore,
  type ActivityFilterStore,
  type AppSettingsStore,
} from '@core/store';
import type { ActivityDataSource } from '@domain/datasources';
import type {
  ActivityRepository,
  FavoritesRepository,
} from '@domain/repositories';
import type {
  CameraPort,
  HapticsPort,
  LocationPort,
  NotificationPort,
} from '@domain/services';
import {
  DevSeedActivityDataSource,
  LocalActivityDataSource,
  RemoteActivityDataSource,
} from '@infrastructure/datasources';
import {
  ActivityRepositoryImpl,
  StorageFavoritesRepository,
} from '@infrastructure/repositories';
import {
  GeolocationLocationService,
  HapticFeedbackService,
  ImagePickerCameraService,
  NotifeeNotificationService,
} from '@infrastructure/services';
import activitiesJson from '@assets/data/activities.json';

/** Everything the UI can depend on. Only interfaces: presentation never sees concrete classes. */
export interface Dependencies {
  activities: ActivityRepository;
  favorites: FavoritesRepository;
  filterStore: ActivityFilterStore;
  settingsStore: AppSettingsStore;
  notifications: NotificationPort;
  camera: CameraPort;
  location: LocationPort;
  haptics: HapticsPort;
}

const createActivityDataSource = (): ActivityDataSource => {
  const source: ActivityDataSource = env.API_URL
    ? new RemoteActivityDataSource(
        new AxiosAdapter({
          baseURL: env.API_URL,
          timeoutMs: env.API_TIMEOUT_MS,
        }),
      )
    : new LocalActivityDataSource(activitiesJson);

  return __DEV__ && env.DEV_SEED_MULTIPLIER > 0
    ? new DevSeedActivityDataSource(source, env.DEV_SEED_MULTIPLIER)
    : source;
};

/** Composition root: the ONLY place where concrete implementations are chosen. */
export const createContainer = (
  storage: KeyValueStorage = new MMKVStorageAdapter(),
): Dependencies => ({
  activities: new ActivityRepositoryImpl(createActivityDataSource()),
  favorites: new StorageFavoritesRepository(storage),
  filterStore: createActivityFilterStore(storage),
  settingsStore: createAppSettingsStore(storage),
  notifications: new NotifeeNotificationService(),
  camera: new ImagePickerCameraService(),
  location: new GeolocationLocationService(),
  haptics: new HapticFeedbackService(),
});
