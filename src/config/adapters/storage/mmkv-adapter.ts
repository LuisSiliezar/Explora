import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { KeyValueStorage } from './storage-adapter';

export class MMKVStorageAdapter implements KeyValueStorage {
  private readonly mmkv: MMKV;

  constructor(id = 'explora') {
    this.mmkv = createMMKV({ id });
  }

  getItem(key: string): string | null {
    return this.mmkv.getString(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.mmkv.set(key, value);
  }

  removeItem(key: string): void {
    this.mmkv.remove(key);
  }
}
