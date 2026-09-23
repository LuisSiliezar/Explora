export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'OFFLINE'
  | 'VALIDATION'
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export const isDomainError = (error: unknown): error is DomainError =>
  error instanceof DomainError;
