/** Single source of truth for TanStack Query keys (DRY, avoids typos in invalidation). */
export const queryKeys = {
  activities: ['activities'] as const,
  activity: (id: string) => ['activities', id] as const,
  currentPosition: ['current-position'] as const,
};

/** Mutation keys, so any screen can tell whether one is still running (`useIsMutating`). */
export const mutationKeys = {
  refreshActivities: ['refresh-activities'] as const,
};
