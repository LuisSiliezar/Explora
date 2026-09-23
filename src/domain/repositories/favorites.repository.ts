import type { Activity, Favorite } from '@domain/entities';

export interface FavoritesRepository {
  /** Must return the same array reference until data changes (safe for useSyncExternalStore). */
  getAll(): Favorite[];
  isFavorite(activityId: string): boolean;
  add(activity: Activity): Favorite;
  remove(activityId: string): void;
  update(activityId: string, patch: Partial<Omit<Favorite, 'activity'>>): void;
  /** Notifies on every change. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
}
