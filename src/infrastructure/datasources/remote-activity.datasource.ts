import type { HttpAdapter } from '@config/adapters/http';
import type { ActivityDataSource } from '@domain/datasources';
import type { Activity } from '@domain/entities';
import { ActivityMapper } from '@infrastructure/mappers';

/** Ready for when a backend exists: swap it in at the composition root, nothing else changes. */
export class RemoteActivityDataSource implements ActivityDataSource {
  constructor(private readonly http: HttpAdapter) {}

  async getAll(signal?: AbortSignal): Promise<Activity[]> {
    const raw = await this.http.get<unknown>('activities', { signal });
    return ActivityMapper.fromResponse(raw);
  }
}
