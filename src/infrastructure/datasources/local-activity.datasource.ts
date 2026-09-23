import type { ActivityDataSource } from '@domain/datasources';
import type { Activity } from '@domain/entities';
import { ActivityMapper } from '@infrastructure/mappers';

/** Reads the bundled JSON. The raw payload is injected so tests can pass fixtures. */
export class LocalActivityDataSource implements ActivityDataSource {
  private cache: Activity[] | null = null;

  constructor(private readonly raw: unknown) {}

  async getAll(): Promise<Activity[]> {
    this.cache ??= ActivityMapper.fromResponse(this.raw);
    return this.cache;
  }
}
