import type { Coordinates } from '@domain/entities';

export type { Coordinates };

export interface LocationPort {
  requestPermission(): Promise<boolean>;
  getCurrentPosition(): Promise<Coordinates>;
}
