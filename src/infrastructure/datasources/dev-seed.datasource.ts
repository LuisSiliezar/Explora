import type { ActivityDataSource } from '@domain/datasources';
import type { Activity } from '@domain/entities';

/**
 * Decorator for performance profiling: repeats the wrapped source's items `multiplier` times
 * with unique ids (12 seeds x 100 = 1200 items). Only wired in __DEV__.
 */
export class DevSeedActivityDataSource implements ActivityDataSource {
  constructor(
    private readonly inner: ActivityDataSource,
    private readonly multiplier: number,
  ) {}

  async getAll(signal?: AbortSignal): Promise<Activity[]> {
    const seeds = await this.inner.getAll(signal);
    return Array.from({ length: this.multiplier }, (_, copy) =>
      seeds.map(seed => ({
        ...seed,
        id: `${seed.id}-${copy}`,
        title: `${seed.title} #${copy + 1}`,
      })),
    ).flat();
  }
}
