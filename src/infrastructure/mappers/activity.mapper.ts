import type { Activity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  ActivitiesResponseSchema,
  ActivityDtoSchema,
  type ActivityDto,
} from '@infrastructure/interfaces';

export class ActivityMapper {
  static toEntity({ latitude, longitude, ...dto }: ActivityDto): Activity {
    return {
      ...dto,
      coordinates:
        latitude !== undefined && longitude !== undefined
          ? { latitude, longitude }
          : undefined,
      searchText:
        `${dto.title} ${dto.description} ${dto.location} ${dto.category}`.toLowerCase(),
    };
  }

  /** Validates an unknown payload (bundled JSON or API response) and maps it to entities. */
  static fromResponse(raw: unknown): Activity[] {
    const result = ActivitiesResponseSchema.safeParse(raw);
    if (!result.success) {
      throw new DomainError(
        'VALIDATION',
        `Invalid activities payload: ${result.error.message}`,
        result.error,
      );
    }
    return result.data.activities.map(ActivityMapper.toEntity);
  }

  /** Validates a single raw activity (e.g. the one a refresh returns) and maps it. */
  static fromDto(raw: unknown): Activity {
    const result = ActivityDtoSchema.safeParse(raw);
    if (!result.success) {
      throw new DomainError(
        'VALIDATION',
        `Invalid activity payload: ${result.error.message}`,
        result.error,
      );
    }
    return ActivityMapper.toEntity(result.data);
  }
}
