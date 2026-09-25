import { MemoryStorage } from '@config/adapters/storage';
import { refreshActivitiesUseCase } from '@core/use-cases';
import type { ActivityDataSource } from '@domain/datasources';
import type { Activity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { MockActivityFeedDataSource } from '@infrastructure/datasources';
import { ActivityDtoSchema } from '@infrastructure/interfaces';
import {
  FailingActivityFeedDataSource,
  createActivityRepository,
  deferred,
  seedActivities,
} from './helpers/fakes';

describe('refresh (core behavior)', () => {
  it('adds exactly one activity with a unique id', async () => {
    const repository = createActivityRepository();

    const added = await refreshActivitiesUseCase(repository);
    const all = await repository.getAll();

    expect(all).toHaveLength(seedActivities.length + 1);
    expect(all[all.length - 1]).toEqual(added);
    expect(seedActivities.some(a => a.id === added.id)).toBe(false);
  });

  it('keeps every id unique across many refreshes', async () => {
    const repository = createActivityRepository();
    for (let i = 0; i < 25; i++) {
      await refreshActivitiesUseCase(repository);
    }
    const ids = (await repository.getAll()).map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(seedActivities.length + 25);
  });

  it('survives an app restart (persisted synchronously)', async () => {
    const storage = new MemoryStorage();
    const added = await createActivityRepository({ storage }).refresh();

    // A brand-new repository on the same storage = the app after a cold start.
    const afterRestart = createActivityRepository({ storage });

    expect((await afterRestart.getById(added.id)).title).toBe(added.title);
  });

  it('retries when the feed returns an id that already exists', async () => {
    const duplicate = { ...seedActivities[0], id: 'gen-dup' };
    const fresh = { ...seedActivities[1], id: 'gen-fresh' };
    const fetchNew = jest
      .fn<Promise<Activity>, []>()
      .mockResolvedValueOnce(duplicate)
      .mockResolvedValueOnce(duplicate)
      .mockResolvedValueOnce(fresh);
    const repository = createActivityRepository({ feed: { fetchNew } });

    await repository.refresh();
    await expect(repository.refresh()).resolves.toEqual(fresh);
  });

  it('clearAdded forgets the added activities', async () => {
    const repository = createActivityRepository();
    await repository.refresh();
    repository.clearAdded();
    expect(await repository.getAll()).toHaveLength(seedActivities.length);
  });

  it('generated activities are valid payloads with a search haystack', async () => {
    const feed = new MockActivityFeedDataSource();
    const activity = await feed.fetchNew();
    expect(
      ActivityDtoSchema.safeParse({
        ...activity,
        latitude: activity.coordinates?.latitude,
        longitude: activity.coordinates?.longitude,
      }).success,
    ).toBe(true);
    expect(activity.searchText).toContain(activity.title.toLowerCase());
  });
});

describe('refresh (failure case)', () => {
  it('rejects with the domain error and changes nothing', async () => {
    const storage = new MemoryStorage();
    const repository = createActivityRepository({
      storage,
      feed: new FailingActivityFeedDataSource(
        new DomainError('NETWORK', 'timeout'),
      ),
    });

    await expect(repository.refresh()).rejects.toMatchObject<
      Partial<DomainError>
    >({ code: 'NETWORK' });
    expect(await repository.getAll()).toEqual(seedActivities);
    expect(storage.getItem('added-activities:v1')).toBeNull();
  });

  it('adds nothing when the request is aborted after the response arrived', async () => {
    const controller = new AbortController();
    const repository = createActivityRepository({
      feed: {
        fetchNew: async () => {
          controller.abort();
          return { ...seedActivities[0], id: 'gen-aborted' };
        },
      },
    });

    await expect(repository.refresh(controller.signal)).rejects.toBeInstanceOf(
      DomainError,
    );
    expect(await repository.getAll()).toHaveLength(seedActivities.length);
  });

  it('starts empty instead of crashing on corrupted persisted data', async () => {
    const storage = new MemoryStorage();
    storage.setItem('added-activities:v1', '{not json');
    expect(await createActivityRepository({ storage }).getAll()).toEqual(
      seedActivities,
    );
  });
});

describe('late results', () => {
  it('a catalog read that started before a refresh still includes its item', async () => {
    const slowCatalog = deferred<Activity[]>();
    let calls = 0;
    const dataSource: ActivityDataSource = {
      getAll: () =>
        ++calls === 1 ? slowCatalog.promise : Promise.resolve(seedActivities),
    };
    const repository = createActivityRepository({ dataSource });

    const lateRead = repository.getAll(); // e.g. a refetch on resume, still in flight
    const added = await repository.refresh();
    slowCatalog.resolve(seedActivities); // ...and it lands after the refresh

    expect((await lateRead).map(a => a.id)).toContain(added.id);
  });
});
