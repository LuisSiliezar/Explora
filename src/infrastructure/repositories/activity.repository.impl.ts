import type {
  ActivityDataSource,
  ActivityFeedDataSource,
} from '@domain/datasources';
import type { Activity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import type { ActivityRepository } from '@domain/repositories';
import type { AddedActivitiesStorage } from './added-activities.storage';

/** Random ids colliding this many times in a row means the feed is broken, not unlucky. */
const MAX_ID_ATTEMPTS = 3;

export class ActivityRepositoryImpl implements ActivityRepository {
  constructor(
    private readonly dataSource: ActivityDataSource,
    private readonly feed: ActivityFeedDataSource,
    private readonly added: AddedActivitiesStorage,
  ) {}

  async getAll(signal?: AbortSignal): Promise<Activity[]> {
    const base = await this.dataSource.getAll(signal);
    // Read the additions AFTER the await: a slow catalog response that started before a
    // refresh still includes the item that refresh added, so late results never drop it.
    const added = this.added.getAll();
    if (added.length === 0) {
      return base;
    }
    const baseIds = new Set(base.map(item => item.id));
    return [...base, ...added.filter(item => !baseIds.has(item.id))];
  }

  async getById(id: string, signal?: AbortSignal): Promise<Activity> {
    const activity = (await this.getAll(signal)).find(item => item.id === id);
    if (!activity) {
      throw new DomainError('NOT_FOUND', `Activity ${id} not found`);
    }
    return activity;
  }

  async refresh(signal?: AbortSignal): Promise<Activity> {
    for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
      const activity = await this.feed.fetchNew(signal);
      if (signal?.aborted) {
        throw new DomainError('UNKNOWN', 'Refresh aborted');
      }
      // Feed ids are namespaced (`gen-…`), so only earlier additions can collide.
      if (!this.added.has(activity.id)) {
        this.added.add(activity); // the single, synchronous write
        return activity;
      }
    }
    throw new DomainError('UNKNOWN', 'Refresh kept returning existing ids');
  }

  clearAdded(): void {
    this.added.clear();
  }
}
