import { MemoryStorage } from '@config/adapters/storage';
import {
  createActivityFilterStore,
  createAppSettingsStore,
  detectLanguage,
} from '@core/store';

describe('activity filter store', () => {
  it('toggles categories and durations', () => {
    const store = createActivityFilterStore(new MemoryStorage());
    store.getState().toggleCategory('Culture');
    store.getState().toggleCategory('Leisure');
    store.getState().toggleCategory('Culture');
    store.getState().toggleDuration('short');
    expect(store.getState().categories).toEqual(['Leisure']);
    expect(store.getState().duration).toBe('short');
    store.getState().toggleDuration('short');
    expect(store.getState().duration).toBeNull();
  });

  it('migrates the v1 single category', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      'activity-filter:v1',
      JSON.stringify({
        state: { query: 'walk', category: 'Outdoors' },
        version: 0,
      }),
    );
    const store = createActivityFilterStore(storage);
    expect(store.getState()).toMatchObject({
      query: 'walk',
      categories: ['Outdoors'],
      duration: null,
    });
  });

  it('persists synchronously and restores after a restart', () => {
    const storage = new MemoryStorage();
    createActivityFilterStore(storage).getState().toggleCategory('Workshops');
    expect(createActivityFilterStore(storage).getState().categories).toEqual([
      'Workshops',
    ]);
  });
});

describe('app settings store', () => {
  it('survives a restart', () => {
    const storage = new MemoryStorage();
    const first = createAppSettingsStore(storage);
    first.getState().completeOnboarding();
    first.getState().setLanguage('es');
    first.getState().setTextScale(1.12);
    first.getState().setAccount({ email: 'ana@example.com' });

    const restored = createAppSettingsStore(storage).getState();
    expect(restored).toMatchObject({
      onboardingDone: true,
      language: 'es',
      textScale: 1.12,
      account: { email: 'ana@example.com' },
    });
  });

  it('turns "near me" off when location is denied', () => {
    const store = createAppSettingsStore(new MemoryStorage());
    store.getState().setLocationPermission('granted');
    store.getState().setNearMe(true);
    store.getState().setLocationPermission('denied');
    expect(store.getState().nearMe).toBe(false);
  });

  it('merges notification preferences', () => {
    const store = createAppSettingsStore(new MemoryStorage());
    store.getState().setNotifications({ status: 'granted', weekly: true });
    expect(store.getState().notifications).toEqual({
      status: 'granted',
      weekly: true,
      reminders: true,
    });
  });

  it('detects Spanish locales', () => {
    expect(detectLanguage('es-MX')).toBe('es');
    expect(detectLanguage('en-US')).toBe('en');
    expect(detectLanguage('fr-FR')).toBe('en');
  });
});
