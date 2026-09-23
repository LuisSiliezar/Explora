/** Synchronous key-value storage. Sync writes mean nothing is lost if the app is backgrounded/killed. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
