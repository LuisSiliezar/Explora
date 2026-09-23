import type { Activity } from '@domain/entities';
import type { ActivityRepository } from '@domain/repositories';

export const getActivitiesUseCase = (
  repository: ActivityRepository,
  signal?: AbortSignal,
): Promise<Activity[]> => repository.getAll(signal);
