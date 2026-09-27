import type { LogContext, LogLevel, LoggerPort } from '@domain/services';
import { isDomainError } from '@domain/errors';

type ConsoleSink = Pick<Console, LogLevel>;

const RANK: Record<LogLevel | 'silent', number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

/** Errors print as `{}` in some consoles: turn them into plain, readable objects. */
const serialize = (value: unknown, depth = 0): unknown => {
  if (!(value instanceof Error) || depth > 2) {
    return value;
  }
  return {
    name: value.name,
    ...(isDomainError(value) ? { code: value.code } : {}),
    message: value.message,
    ...(value.cause !== undefined
      ? { cause: serialize(value.cause, depth + 1) }
      : {}),
  };
};

const serializeContext = (context: LogContext): LogContext =>
  Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, serialize(value)]),
  );

/** The only file that uses `console` (enforced by ESLint `no-console`). */
export class ConsoleLogger implements LoggerPort {
  constructor(
    private readonly minLevel: LogLevel | 'silent',
    private readonly sink: ConsoleSink = console,
  ) {}

  debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.write('error', message, context);
  }

  private write(level: LogLevel, message: string, context?: LogContext): void {
    if (RANK[level] < RANK[this.minLevel]) {
      return;
    }
    try {
      const line = `[Explora] ${message}`;
      if (context) {
        this.sink[level](line, serializeContext(context));
      } else {
        this.sink[level](line);
      }
    } catch {
      // Logging is diagnostics only: never break the caller over it.
    }
  }
}
