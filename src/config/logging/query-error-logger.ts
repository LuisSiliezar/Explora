import { isCancelledError, type QueryClient } from '@tanstack/react-query';
import type { LoggerPort } from '@domain/services';

/**
 * Logs every query and mutation that ends in an error, in one place instead of in each hook.
 * Retries don't log: only the final failure does. Cancellations are not failures.
 * Returns an unsubscribe function.
 */
export const logQueryErrors = (
  queryClient: QueryClient,
  logger: LoggerPort,
): (() => void) => {
  const unsubscribeQueries = queryClient.getQueryCache().subscribe(event => {
    if (
      event.type === 'updated' &&
      event.action.type === 'error' &&
      !isCancelledError(event.action.error)
    ) {
      logger.error('Query failed', {
        queryKey: event.query.queryKey,
        error: event.action.error,
      });
    }
  });
  const unsubscribeMutations = queryClient
    .getMutationCache()
    .subscribe(event => {
      if (event.type === 'updated' && event.action.type === 'error') {
        logger.error('Mutation failed', {
          mutationKey: event.mutation.options.mutationKey,
          error: event.action.error,
        });
      }
    });
  return () => {
    unsubscribeQueries();
    unsubscribeMutations();
  };
};
