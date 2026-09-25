import type { NetworkSimulation } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  SimulatedActivityDataSource,
  SimulatedActivityFeedDataSource,
} from '@infrastructure/datasources';
import { InMemoryActivityDataSource, seedActivities } from './helpers/fakes';

describe('network simulation (dev reviewer toggle)', () => {
  let mode: NetworkSimulation = 'normal';
  const config = { getMode: () => mode, slowMs: 4000 };
  const source = new SimulatedActivityDataSource(
    new InMemoryActivityDataSource(),
    config,
  );

  beforeEach(() => {
    jest.useFakeTimers();
    mode = 'normal';
  });
  afterEach(() => jest.useRealTimers());

  /** Runs `request` past the simulated delay and returns what it rejected with. */
  const rejectionOf = async (request: Promise<unknown>) => {
    const settled = request.then(
      () => undefined,
      (error: unknown) => error,
    );
    await jest.advanceTimersByTimeAsync(4000);
    return settled;
  };

  it('passes straight through in normal mode', async () => {
    await expect(source.getAll()).resolves.toEqual(seedActivities);
  });

  it('delays in slow mode', async () => {
    mode = 'slow';
    const onDone = jest.fn();
    const pending = source.getAll().then(onDone);

    await jest.advanceTimersByTimeAsync(3999);
    expect(onDone).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    await pending;
    expect(onDone).toHaveBeenCalledWith(seedActivities);
  });

  it('fails with NETWORK in fail mode', async () => {
    mode = 'fail';
    expect(await rejectionOf(source.getAll())).toMatchObject<
      Partial<DomainError>
    >({ code: 'NETWORK' });
  });

  it('reads the mode per request, so the toggle applies immediately', async () => {
    mode = 'fail';
    expect(await rejectionOf(source.getAll())).toBeInstanceOf(DomainError);

    mode = 'normal';
    await expect(source.getAll()).resolves.toEqual(seedActivities);
  });

  it('stops waiting when the request is aborted', async () => {
    mode = 'slow';
    const controller = new AbortController();
    const pending = source.getAll(controller.signal);
    controller.abort();
    await expect(pending).rejects.toBeInstanceOf(DomainError);
  });

  it('wraps the refresh feed the same way', async () => {
    mode = 'fail';
    const feed = new SimulatedActivityFeedDataSource(
      { fetchNew: async () => seedActivities[0] },
      config,
    );
    expect(await rejectionOf(feed.fetchNew())).toMatchObject<
      Partial<DomainError>
    >({ code: 'NETWORK' });
  });
});
