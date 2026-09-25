import type { Activity } from '@domain/entities';

/** Where "refresh" gets one new activity from (a mock server today, a real API later). */
export interface ActivityFeedDataSource {
  fetchNew(signal?: AbortSignal): Promise<Activity>;
}
