import { MemoryStorage } from '@config/adapters/storage';
import type { Dependencies } from '@config/di';
import {
  createActivityFilterStore,
  createAppSettingsStore,
  createDevSettingsStore,
} from '@core/store';
import type {
  ActivityDataSource,
  ActivityFeedDataSource,
} from '@domain/datasources';
import type { Activity } from '@domain/entities';
import type {
  CameraPort,
  HapticsPort,
  LocationPort,
  NotificationPort,
  PhotoSource,
  ReminderRequest,
} from '@domain/services';
import { MockActivityFeedDataSource } from '@infrastructure/datasources';
import { ActivityMapper } from '@infrastructure/mappers';
import {
  ActivityRepositoryImpl,
  AddedActivitiesStorage,
  StorageFavoritesRepository,
} from '@infrastructure/repositories';
import activitiesJson from '@assets/data/activities.json';

export const seedActivities: Activity[] =
  ActivityMapper.fromResponse(activitiesJson);

export class InMemoryActivityDataSource implements ActivityDataSource {
  constructor(private readonly items: Activity[] = seedActivities) {}
  async getAll() {
    return this.items;
  }
}

/** Fails like a remote source would (offline, timeout, bad payload...). */
export class FailingActivityDataSource implements ActivityDataSource {
  constructor(private readonly error: unknown) {}
  async getAll(): Promise<Activity[]> {
    throw this.error;
  }
}

/** A feed that fails like a remote source would. */
export class FailingActivityFeedDataSource implements ActivityFeedDataSource {
  constructor(private readonly error: unknown) {}
  async fetchNew(): Promise<Activity> {
    throw this.error;
  }
}

/** Something that resolves only when the test says so (to reproduce late results). */
export const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/** Repository wired like the container, but with in-memory storage and fakes. */
export const createActivityRepository = ({
  dataSource = new InMemoryActivityDataSource(),
  feed = new MockActivityFeedDataSource(),
  storage = new MemoryStorage(),
}: {
  dataSource?: ActivityDataSource;
  feed?: ActivityFeedDataSource;
  storage?: MemoryStorage;
} = {}) =>
  new ActivityRepositoryImpl(
    dataSource,
    feed,
    new AddedActivitiesStorage(storage),
  );

export const createFakeNotifications = (): jest.Mocked<NotificationPort> => ({
  requestPermission: jest.fn(async () => true),
  scheduleReminder: jest.fn<Promise<string>, [ReminderRequest]>(
    async () => 'reminder-1',
  ),
  cancel: jest.fn<Promise<void>, [string]>(async () => undefined),
  getInitialOpenedActivity: jest.fn<Promise<string | null>, []>(
    async () => null,
  ),
  onReminderOpened: jest.fn<() => void, [(activityId: string) => void]>(
    () => () => undefined,
  ),
});

export const createFakeCamera = (
  uri: string | null = 'file:///photo.jpg',
): jest.Mocked<CameraPort> => ({
  pickPhoto: jest.fn<Promise<string | null>, [PhotoSource]>(async () => uri),
});

export const createFakeLocation = (): jest.Mocked<LocationPort> => ({
  requestPermission: jest.fn(async () => true),
  getCurrentPosition: jest.fn(async () => ({ latitude: 1, longitude: 2 })),
});

export const createFakeHaptics = (): jest.Mocked<HapticsPort> => ({
  selection: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
});

/** A full container built only from in-memory fakes (Liskov: drop-in for the real one). */
export const createFakeContainer = (
  overrides: Partial<Dependencies> = {},
): Dependencies => {
  const storage = new MemoryStorage();
  return {
    activities: createActivityRepository({ storage }),
    favorites: new StorageFavoritesRepository(storage),
    filterStore: createActivityFilterStore(storage),
    settingsStore: createAppSettingsStore(storage),
    devSettingsStore: createDevSettingsStore(storage),
    notifications: createFakeNotifications(),
    camera: createFakeCamera(),
    location: createFakeLocation(),
    haptics: createFakeHaptics(),
    ...overrides,
  };
};
