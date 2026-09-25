import type { KeyValueStorage } from '@config/adapters/storage';
import type { Activity } from '@domain/entities';

const STORAGE_KEY = 'added-activities:v1';

/** Activities added by refresh. Writes are synchronous, so an app kill can't lose one. */
export class AddedActivitiesStorage {
  private items: Activity[];

  constructor(private readonly storage: KeyValueStorage) {
    this.items = this.load();
  }

  getAll(): Activity[] {
    return this.items;
  }

  has(id: string): boolean {
    return this.items.some(item => item.id === id);
  }

  add(activity: Activity): void {
    this.items = [...this.items, activity];
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  }

  clear(): void {
    this.items = [];
    this.storage.removeItem(STORAGE_KEY);
  }

  private load(): Activity[] {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as Activity[]) : [];
    } catch {
      return []; // corrupted data should never crash the app
    }
  }
}
