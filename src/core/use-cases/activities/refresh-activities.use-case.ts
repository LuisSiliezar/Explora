import type { Activity } from '@domain/entities';
import type { ActivityRepository } from '@domain/repositories';

/** Pull to refresh: adds one new activity. A failure rejects and adds nothing. */
export const refreshActivitiesUseCase = (
  repository: ActivityRepository,
  signal?: AbortSignal,
): Promise<Activity> => repository.refresh(signal);
