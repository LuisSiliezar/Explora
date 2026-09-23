import type { Activity } from '@domain/entities';

/** A source of activities (bundled JSON, remote API, cache...). */
export interface ActivityDataSource {
  getAll(signal?: AbortSignal): Promise<Activity[]>;
}
