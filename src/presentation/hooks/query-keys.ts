/** Single source of truth for TanStack Query keys (DRY, avoids typos in invalidation). */
export const queryKeys = {
  activities: ['activities'] as const,
  activity: (id: string) => ['activities', id] as const,
  currentPosition: ['current-position'] as const,
};
