import type { Activity } from '@domain/entities';

export interface ActivityRepository {
  getAll(signal?: AbortSignal): Promise<Activity[]>;
  /** Rejects with DomainError('NOT_FOUND') when the id does not exist. */
  getById(id: string, signal?: AbortSignal): Promise<Activity>;
}
