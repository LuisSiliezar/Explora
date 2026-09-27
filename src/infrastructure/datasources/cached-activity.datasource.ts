import type { KeyValueStorage } from '@config/adapters/storage';
import type { ActivityDataSource } from '@domain/datasources';
import type { Activity } from '@domain/entities';
import { DomainError, isDomainError } from '@domain/errors';
import type { LoggerPort } from '@domain/services';

const STORAGE_KEY = 'activities-cache:v1';

/**
 * Decorator that keeps the catalog available offline: every good response is written
 * synchronously to storage, and a network failure falls back to that last good copy.
 */
export class CachedActivityDataSource implements ActivityDataSource {
  private memory: Activity[] | null = null;

  constructor(
    private readonly inner: ActivityDataSource,
    private readonly storage: KeyValueStorage,
    private readonly logger: LoggerPort,
  ) {}

  async getAll(signal?: AbortSignal): Promise<Activity[]> {
    try {
      const activities = await this.inner.getAll(signal);
      this.memory = activities;
      this.storage.setItem(STORAGE_KEY, JSON.stringify(activities));
      return activities;
    } catch (error) {
      if (
        signal?.aborted ||
        !isDomainError(error) ||
        error.code !== 'NETWORK'
      ) {
        throw error; // cancellations and bad payloads are not "offline"
      }
      const cached = this.memory ?? this.load();
      if (!cached) {
        throw new DomainError(
          'OFFLINE',
          'Catalog unavailable offline and nothing is cached yet',
          error,
        );
      }
      this.logger.warn('Catalog request failed, serving the cached copy', {
        count: cached.length,
        error,
      });
      this.memory = cached;
      return cached;
    }
  }

  private load(): Activity[] | null {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? (parsed as Activity[]) : null;
    } catch (error) {
      this.logger.warn('Cached catalog is corrupt, ignoring it', { error });
      return null; // corrupted data should never crash the app
    }
  }
}
