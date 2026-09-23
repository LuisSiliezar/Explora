import { MemoryStorage } from '@config/adapters/storage';
import { createActivityFilterStore } from '@core/store';
import {
  resetLocalDataUseCase,
  restoreFavoriteUseCase,
  toggleFavoriteUseCase,
} from '@core/use-cases';
import { StorageFavoritesRepository } from '@infrastructure/repositories';
import { createFakeNotifications, seedActivities } from './helpers/fakes';

const setup = () => {
  const storage = new MemoryStorage();
  return {
    favorites: new StorageFavoritesRepository(storage),
    notifications: createFakeNotifications(),
    filterStore: createActivityFilterStore(storage),
  };
};

describe('restoreFavoriteUseCase (Undo)', () => {
  it('puts back the removed favorite with its photo and position', async () => {
    const deps = setup();
    const [first] = seedActivities;
    deps.favorites.add(first);
    deps.favorites.update(first.id, { photoUri: 'file:///p.jpg', savedAt: 5 });
    const snapshot = deps.favorites.getAll()[0];

    await toggleFavoriteUseCase(deps, first);
    expect(deps.favorites.isFavorite(first.id)).toBe(false);

    restoreFavoriteUseCase(deps, snapshot);
    expect(deps.favorites.getAll()[0]).toMatchObject({
      activity: first,
      photoUri: 'file:///p.jpg',
      savedAt: 5,
    });
  });

  it('is a no-op when the activity is already a favorite again', () => {
    const deps = setup();
    const fav = deps.favorites.add(seedActivities[0]);
    const before = deps.favorites.getAll();
    restoreFavoriteUseCase(deps, fav);
    expect(deps.favorites.getAll()).toBe(before);
  });
});

describe('resetLocalDataUseCase', () => {
  it('removes every favorite, cancels reminders and clears filters', async () => {
    const deps = setup();
    deps.favorites.add(seedActivities[0]);
    deps.favorites.add(seedActivities[1]);
    deps.favorites.update(seedActivities[1].id, { reminderId: 'r-1' });
    deps.filterStore.getState().setQuery('walk');

    await resetLocalDataUseCase({
      ...deps,
      resetFilters: deps.filterStore.getState().reset,
    });

    expect(deps.favorites.getAll()).toEqual([]);
    expect(deps.notifications.cancel).toHaveBeenCalledWith('r-1');
    expect(deps.filterStore.getState().query).toBe('');
  });
});
