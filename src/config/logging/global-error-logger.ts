import type { LoggerPort } from '@domain/services';

/**
 * Logs uncaught JS errors, then hands them to the previous handler, so the dev red box
 * and the release crash behave exactly as before. Returns a function that restores it.
 */
export const installGlobalErrorLogger = (logger: LoggerPort): (() => void) => {
  if (typeof ErrorUtils === 'undefined') {
    return () => undefined; // not running under React Native (plain jest)
  }
  const previous = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    logger.error(isFatal ? 'Fatal JS error' : 'Uncaught JS error', { error });
    previous(error, isFatal);
  });
  return () => ErrorUtils.setGlobalHandler(previous);
};
