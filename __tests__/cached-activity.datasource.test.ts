import { MemoryStorage } from '@config/adapters/storage';
import { queryClient } from '@config/query';
import type { ActivityDataSource } from '@domain/datasources';
import { DomainError } from '@domain/errors';
import { CachedActivityDataSource } from '@infrastructure/datasources';
import { ActivityRepositoryImpl } from '@infrastructure/repositories';
import {
  FailingActivityDataSource,
  InMemoryActivityDataSource,
  seedActivities,
} from './helpers/fakes';

const CACHE_KEY = 'activities-cache:v1';
const networkError = () => new DomainError('NETWORK', 'GET activities failed');

/** A source whose behaviour the test flips between online and offline. */
class SwitchableSource implements ActivityDataSource {
  online = true;
  async getAll() {
    if (!this.online) {
      throw networkError();
    }
    return seedActivities;
  }
}

describe('CachedActivityDataSource', () => {
  it('writes every good response to storage synchronously', async () => {
    const storage = new MemoryStorage();
    const source = new CachedActivityDataSource(
      new InMemoryActivityDataSource(),
      storage,
    );

    await source.getAll();

    expect(JSON.parse(storage.getItem(CACHE_KEY) ?? 'null')).toHaveLength(12);
  });

  it('falls back to the last good copy on a network failure', async () => {
    const inner = new SwitchableSource();
    const source = new CachedActivityDataSource(inner, new MemoryStorage());
    await source.getAll();

    inner.online = false;

    expect(await source.getAll()).toEqual(seedActivities);
  });

  it('reads the cache persisted by a previous session (process death)', async () => {
    const storage = new MemoryStorage();
    await new CachedActivityDataSource(
      new InMemoryActivityDataSource(),
      storage,
    ).getAll();

    const relaunched = new CachedActivityDataSource(
      new FailingActivityDataSource(networkError()),
      storage,
    );

    expect(await relaunched.getAll()).toHaveLength(12);
  });

  it('throws OFFLINE when the network fails and nothing is cached', async () => {
    const source = new CachedActivityDataSource(
      new FailingActivityDataSource(networkError()),
      new MemoryStorage(),
    );

    await expect(source.getAll()).rejects.toMatchObject<Partial<DomainError>>({
      code: 'OFFLINE',
    });
  });

  it('treats a corrupted cache as empty instead of crashing', async () => {
    const storage = new MemoryStorage();
    storage.setItem(CACHE_KEY, '{not json');
    const source = new CachedActivityDataSource(
      new FailingActivityDataSource(networkError()),
      storage,
    );

    await expect(source.getAll()).rejects.toMatchObject<Partial<DomainError>>({
      code: 'OFFLINE',
    });
  });

  it('does not hide non-network errors behind the cache', async () => {
    const storage = new MemoryStorage();
    storage.setItem(CACHE_KEY, JSON.stringify(seedActivities));
    const validation = new DomainError('VALIDATION', 'bad payload');
    const source = new CachedActivityDataSource(
      new FailingActivityDataSource(validation),
      storage,
    );

    await expect(source.getAll()).rejects.toBe(validation);
  });

  it('rethrows cancellations without falling back', async () => {
    const storage = new MemoryStorage();
    storage.setItem(CACHE_KEY, JSON.stringify(seedActivities));
    const controller = new AbortController();
    controller.abort();
    const error = networkError();
    const source = new CachedActivityDataSource(
      new FailingActivityDataSource(error),
      storage,
    );

    await expect(source.getAll(controller.signal)).rejects.toBe(error);
  });

  it('is a drop-in ActivityDataSource for the repository (LSP)', async () => {
    const repository = new ActivityRepositoryImpl(
      new CachedActivityDataSource(
        new InMemoryActivityDataSource(),
        new MemoryStorage(),
      ),
    );

    expect((await repository.getById('act-007')).title).toBe(
      'Pottery Workshop',
    );
  });
});

describe('queryClient offline defaults', () => {
  const { queries } = queryClient.getDefaultOptions();
  const retry = queries?.retry as (count: number, error: unknown) => boolean;

  it('runs the first attempt even while offline', () => {
    expect(queries?.networkMode).toBe('offlineFirst');
  });

  it('does not retry OFFLINE, which only reconnecting can fix', () => {
    expect(retry(0, new DomainError('OFFLINE', 'offline'))).toBe(false);
    expect(retry(0, networkError())).toBe(true);
  });
});
