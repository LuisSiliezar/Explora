export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

/** Diagnostics. Implementations must never throw: logging can't break a user action. */
export interface LoggerPort {
  /** Noisy detail, only useful while developing. */
  debug(message: string, context?: LogContext): void;
  /** Normal milestones (startup, refresh). */
  info(message: string, context?: LogContext): void;
  /** Something failed but the app recovered (fallback, best-effort call). */
  warn(message: string, context?: LogContext): void;
  /** Something failed and the user saw it, or nothing recovered. */
  error(message: string, context?: LogContext): void;
}
