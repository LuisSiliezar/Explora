import { QueryClient } from '@tanstack/react-query';
import { logQueryErrors } from '@config/logging';
import { DomainError } from '@domain/errors';
import { createFakeLogger } from './helpers/fakes';

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const logger = createFakeLogger();
  const stop = logQueryErrors(queryClient, logger);
  return { queryClient, logger, stop };
};

describe('logQueryErrors', () => {
  it('logs a query that fails', async () => {
    const { queryClient, logger, stop } = setup();
    const error = new DomainError('NETWORK', 'GET activities failed');

    await queryClient
      .fetchQuery({
        queryKey: ['activities'],
        queryFn: () => Promise.reject(error),
      })
      .catch(() => undefined);

    expect(logger.error).toHaveBeenCalledWith('Query failed', {
      queryKey: ['activities'],
      error,
    });
    stop();
  });

  it('logs a mutation that fails', async () => {
    const { queryClient, logger, stop } = setup();
    const error = new DomainError('NETWORK', 'refresh failed');

    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationKey: ['refresh'],
        mutationFn: () => Promise.reject(error),
      })
      .execute(undefined)
      .catch(() => undefined);

    expect(logger.error).toHaveBeenCalledWith('Mutation failed', {
      mutationKey: ['refresh'],
      error,
    });
    stop();
  });

  it('does not log cancelled queries', async () => {
    const { queryClient, logger, stop } = setup();
    const pending = queryClient
      .fetchQuery({
        queryKey: ['slow'],
        queryFn: () => new Promise(() => undefined),
      })
      .catch(() => undefined);

    await queryClient.cancelQueries({ queryKey: ['slow'] });
    await pending;

    expect(logger.error).not.toHaveBeenCalled();
    stop();
  });

  it('stops logging after unsubscribing', async () => {
    const { queryClient, logger, stop } = setup();
    stop();

    await queryClient
      .fetchQuery({
        queryKey: ['x'],
        queryFn: () => Promise.reject(new Error('x')),
      })
      .catch(() => undefined);

    expect(logger.error).not.toHaveBeenCalled();
  });
});
