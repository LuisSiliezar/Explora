import type { DurationFilter } from '@domain/entities';
import type { StringKey } from '@presentation/i18n';

/** Duration buckets offered in the filter sheet, in display order. */
export const DURATIONS: { value: DurationFilter; label: StringKey }[] = [
  { value: 'short', label: 'durShort' },
  { value: 'mid', label: 'durMid' },
  { value: 'long', label: 'durLong' },
];
