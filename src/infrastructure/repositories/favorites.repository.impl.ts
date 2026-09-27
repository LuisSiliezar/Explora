import type { KeyValueStorage } from '@config/adapters/storage';
import type { Activity, Favorite } from '@domain/entities';
import type { FavoritesRepository } from '@domain/repositories';
import type { LoggerPort } from '@domain/services';

const STORAGE_KEY = 'favorites:v1';

/**
 * Local-first favorites. Every mutation is written synchronously to storage,
 * so nothing is lost if the OS kills the app while it is in background.
 */
export class StorageFavoritesRepository implements FavoritesRepository {
  private byId: Record<string, Favorite>;
  private snapshot: Favorite[];
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly logger: LoggerPort,
  ) {
    this.byId = this.load();
    this.snapshot = this.toSortedList();
  }

  getAll = (): Favorite[] => this.snapshot;

  isFavorite(activityId: string): boolean {
    return activityId in this.byId;
  }

  add(activity: Activity): Favorite {
    const favorite: Favorite = { activity, savedAt: Date.now() };
    this.commit({ ...this.byId, [activity.id]: favorite });
    return favorite;
  }

  remove(activityId: string): void {
    if (!(activityId in this.byId)) {
      return;
    }
    const next = { ...this.byId };
    delete next[activityId];
    this.commit(next);
  }

  update(activityId: string, patch: Partial<Omit<Favorite, 'activity'>>): void {
    const current = this.byId[activityId];
    if (current) {
      this.commit({ ...this.byId, [activityId]: { ...current, ...patch } });
    }
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private commit(next: Record<string, Favorite>): void {
    this.byId = next;
    this.snapshot = this.toSortedList(); // new reference only when data changes
    this.storage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.listeners.forEach(listener => listener());
  }

  private toSortedList(): Favorite[] {
    return Object.values(this.byId).sort((a, b) => b.savedAt - a.savedAt);
  }

  private load(): Record<string, Favorite> {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, Favorite>) : {};
    } catch (error) {
      this.logger.warn('Stored favorites are corrupt, starting empty', {
        error,
      });
      return {}; // corrupted data should never crash the app
    }
  }
}
