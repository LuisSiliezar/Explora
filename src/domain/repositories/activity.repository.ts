import type { Activity } from '@domain/entities';

export interface ActivityRepository {
  getAll(signal?: AbortSignal): Promise<Activity[]>;
  /** Rejects with DomainError('NOT_FOUND') when the id does not exist. */
  getById(id: string, signal?: AbortSignal): Promise<Activity>;
  /**
   * Adds one new activity with a unique id and persists it before resolving.
   * On failure it rejects with a DomainError and changes nothing.
   */
  refresh(signal?: AbortSignal): Promise<Activity>;
  /** Forgets every activity added by refresh (part of "Reset local data"). */
  clearAdded(): void;
}
