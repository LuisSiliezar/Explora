import { z } from 'zod';

export const SUPPORTED_SCHEMA_VERSION = 1;

export const ActivityDtoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(['Outdoors', 'Culture', 'Workshops', 'Leisure']),
  location: z.string(),
  durationMinutes: z.number().int().nonnegative(),
  // Optional so older payloads (and APIs without geo data) stay valid.
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const ActivitiesResponseSchema = z.object({
  schemaVersion: z.literal(SUPPORTED_SCHEMA_VERSION),
  activities: z.array(ActivityDtoSchema),
});

export type ActivityDto = z.infer<typeof ActivityDtoSchema>;
export type ActivitiesResponseDto = z.infer<typeof ActivitiesResponseSchema>;
