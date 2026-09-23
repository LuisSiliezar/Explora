import type { Activity } from '@domain/entities';
import type { ActivityRepository } from '@domain/repositories';

export const getActivityByIdUseCase = (
  repository: ActivityRepository,
  id: string,
  signal?: AbortSignal,
): Promise<Activity> => repository.getById(id, signal);
