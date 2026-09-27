import { MemoryStorage } from '@config/adapters/storage';
import {
  attachPhotoUseCase,
  clearReminderUseCase,
  scheduleReminderUseCase,
  toggleFavoriteUseCase,
} from '@core/use-cases';
import { StorageFavoritesRepository } from '@infrastructure/repositories';
import {
  createFakeCamera,
  createFakeLogger,
  createFakeNotifications,
  seedActivities,
} from './helpers/fakes';

const [walk] = seedActivities;
const copy = { title: 'Walk', body: 'Empieza pronto' };

describe('favorites', () => {
  it('persists across repository instances (simulates app restart)', async () => {
    const storage = new MemoryStorage();
    const deps = {
      favorites: new StorageFavoritesRepository(storage, createFakeLogger()),
      notifications: createFakeNotifications(),
      logger: createFakeLogger(),
    };

    expect(await toggleFavoriteUseCase(deps, walk)).toBe(true);

    const afterRestart = new StorageFavoritesRepository(
      storage,
      createFakeLogger(),
    );
    expect(afterRestart.isFavorite(walk.id)).toBe(true);
    expect(afterRestart.getAll()[0].activity.title).toBe(walk.title);
  });

  it('keeps a stable snapshot reference until data changes', () => {
    const repo = new StorageFavoritesRepository(
      new MemoryStorage(),
      createFakeLogger(),
    );
    const first = repo.getAll();
    expect(repo.getAll()).toBe(first);
    repo.add(walk);
    expect(repo.getAll()).not.toBe(first);
  });

  it('notifies subscribers on change', () => {
    const repo = new StorageFavoritesRepository(
      new MemoryStorage(),
      createFakeLogger(),
    );
    const listener = jest.fn();
    repo.subscribe(listener);
    repo.add(walk);
    repo.remove(walk.id);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('survives corrupted storage and logs it', () => {
    const storage = new MemoryStorage();
    const logger = createFakeLogger();
    storage.setItem('favorites:v1', '{not json');
    expect(new StorageFavoritesRepository(storage, logger).getAll()).toEqual(
      [],
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'Stored favorites are corrupt, starting empty',
      expect.objectContaining({ error: expect.any(SyntaxError) }),
    );
  });

  it('still unfavorites when cancelling the reminder fails, and logs it', async () => {
    const deps = {
      favorites: new StorageFavoritesRepository(
        new MemoryStorage(),
        createFakeLogger(),
      ),
      notifications: createFakeNotifications(),
      logger: createFakeLogger(),
    };
    await scheduleReminderUseCase(deps, walk, new Date(), copy);
    const failure = new Error('native cancel failed');
    deps.notifications.cancel.mockRejectedValueOnce(failure);

    expect(await toggleFavoriteUseCase(deps, walk)).toBe(false);
    expect(deps.favorites.isFavorite(walk.id)).toBe(false);
    expect(deps.logger.warn).toHaveBeenCalledWith(
      'Cancelling a reminder failed',
      { reminderId: 'reminder-1', error: failure },
    );
  });

  it('cancels the reminder when unfavoriting', async () => {
    const deps = {
      favorites: new StorageFavoritesRepository(
        new MemoryStorage(),
        createFakeLogger(),
      ),
      notifications: createFakeNotifications(),
      logger: createFakeLogger(),
    };
    const fireAt = new Date(Date.now() + 1000);
    await scheduleReminderUseCase(deps, walk, fireAt, copy);
    expect(deps.notifications.scheduleReminder).toHaveBeenCalledWith({
      activityId: walk.id,
      ...copy,
      fireAt,
    });
    expect(deps.favorites.getAll()[0].reminderId).toBe('reminder-1');

    expect(await toggleFavoriteUseCase(deps, walk)).toBe(false);
    expect(deps.notifications.cancel).toHaveBeenCalledWith('reminder-1');
  });

  it('clears the reminder id once the reminder is opened', async () => {
    const deps = {
      favorites: new StorageFavoritesRepository(
        new MemoryStorage(),
        createFakeLogger(),
      ),
      notifications: createFakeNotifications(),
      logger: createFakeLogger(),
    };
    await scheduleReminderUseCase(deps, walk, new Date(), copy);

    clearReminderUseCase(deps, walk.id);

    expect(deps.favorites.isFavorite(walk.id)).toBe(true);
    expect(deps.favorites.getAll()[0].reminderId).toBeUndefined();
  });

  it('refuses to schedule without notification permission', async () => {
    const notifications = createFakeNotifications();
    notifications.requestPermission.mockResolvedValueOnce(false);
    const deps = {
      favorites: new StorageFavoritesRepository(
        new MemoryStorage(),
        createFakeLogger(),
      ),
      notifications,
      logger: createFakeLogger(),
    };
    await expect(
      scheduleReminderUseCase(deps, walk, new Date(), copy),
    ).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
  });

  it('attaching a photo favorites the activity; cancelling changes nothing', async () => {
    const favorites = new StorageFavoritesRepository(
      new MemoryStorage(),
      createFakeLogger(),
    );
    expect(
      await attachPhotoUseCase(
        { favorites, camera: createFakeCamera(null) },
        walk,
        'library',
      ),
    ).toBeNull();
    expect(favorites.isFavorite(walk.id)).toBe(false);

    await attachPhotoUseCase(
      { favorites, camera: createFakeCamera() },
      walk,
      'camera',
    );
    expect(favorites.getAll()[0].photoUri).toBe('file:///photo.jpg');
  });
});
