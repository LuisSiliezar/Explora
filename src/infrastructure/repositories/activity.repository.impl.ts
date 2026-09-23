import type { ActivityDataSource } from '@domain/datasources';
import type { Activity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import type { ActivityRepository } from '@domain/repositories';

export class ActivityRepositoryImpl implements ActivityRepository {
  constructor(private readonly dataSource: ActivityDataSource) {}

  getAll(signal?: AbortSignal): Promise<Activity[]> {
    return this.dataSource.getAll(signal);
  }

  async getById(id: string, signal?: AbortSignal): Promise<Activity> {
    const activity = (await this.dataSource.getAll(signal)).find(
      item => item.id === id,
    );
    if (!activity) {
      throw new DomainError('NOT_FOUND', `Activity ${id} not found`);
    }
    return activity;
  }
}
