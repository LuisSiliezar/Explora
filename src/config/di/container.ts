import { AxiosAdapter } from '@config/adapters/http';
import {
  MMKVStorageAdapter,
  type KeyValueStorage,
} from '@config/adapters/storage';
import { env, isProduction } from '@config/env';
import {
  SIMULATED_SLOW_MS,
  createActivityFilterStore,
  createAppSettingsStore,
  createDevSettingsStore,
  type ActivityFilterStore,
  type AppSettingsStore,
  type DevSettingsStore,
} from '@core/store';
import type {
  ActivityDataSource,
  ActivityFeedDataSource,
} from '@domain/datasources';
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
  CachedActivityDataSource,
  DevSeedActivityDataSource,
  LocalActivityDataSource,
  MockActivityFeedDataSource,
  RemoteActivityDataSource,
  SimulatedActivityDataSource,
  SimulatedActivityFeedDataSource,
  type NetworkSimulationConfig,
} from '@infrastructure/datasources';
import {
  ActivityRepositoryImpl,
  AddedActivitiesStorage,
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
  /** Dev/staging switches (network simulation). Present in prod too, but never read there. */
  devSettingsStore: DevSettingsStore;
  notifications: NotificationPort;
  camera: CameraPort;
  location: LocationPort;
  haptics: HapticsPort;
}

const createActivityDataSource = (
  storage: KeyValueStorage,
  simulation: NetworkSimulationConfig | null,
): ActivityDataSource => {
  // The bundled JSON is already offline; a remote catalog keeps its last good copy.
  const source: ActivityDataSource = env.API_URL
    ? new CachedActivityDataSource(
        new RemoteActivityDataSource(
          new AxiosAdapter({
            baseURL: env.API_URL,
            timeoutMs: env.API_TIMEOUT_MS,
          }),
        ),
        storage,
      )
    : new LocalActivityDataSource(activitiesJson);

  // Never in production. Staging release builds may seed, so perf is measured on a release build.
  const seeded =
    !isProduction && env.DEV_SEED_MULTIPLIER > 0
      ? new DevSeedActivityDataSource(source, env.DEV_SEED_MULTIPLIER)
      : source;
  return simulation
    ? new SimulatedActivityDataSource(seeded, simulation)
    : seeded;
};

const createActivityFeed = (
  simulation: NetworkSimulationConfig | null,
): ActivityFeedDataSource => {
  const feed = new MockActivityFeedDataSource();
  return simulation
    ? new SimulatedActivityFeedDataSource(feed, simulation)
    : feed;
};

/** Composition root: the ONLY place where concrete implementations are chosen. */
export const createContainer = (
  storage: KeyValueStorage = new MMKVStorageAdapter(),
): Dependencies => {
  const devSettingsStore = createDevSettingsStore(storage);
  // Reviewers reproduce slow and failing requests from Settings → Developer (never in prod).
  const simulation: NetworkSimulationConfig | null = isProduction
    ? null
    : {
        getMode: () => devSettingsStore.getState().network,
        slowMs: SIMULATED_SLOW_MS,
      };

  return {
    activities: new ActivityRepositoryImpl(
      createActivityDataSource(storage, simulation),
      createActivityFeed(simulation),
      new AddedActivitiesStorage(storage),
    ),
    favorites: new StorageFavoritesRepository(storage),
    filterStore: createActivityFilterStore(storage),
    settingsStore: createAppSettingsStore(storage),
    devSettingsStore,
    notifications: new NotifeeNotificationService(),
    camera: new ImagePickerCameraService(),
    location: new GeolocationLocationService(),
    haptics: new HapticFeedbackService(),
  };
};
