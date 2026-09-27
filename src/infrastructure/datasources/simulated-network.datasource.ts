import type {
  ActivityDataSource,
  ActivityFeedDataSource,
} from '@domain/datasources';
import type { Activity, NetworkSimulation } from '@domain/entities';
import { DomainError } from '@domain/errors';

export interface NetworkSimulationConfig {
  /** Read on every request, so flipping the dev toggle applies immediately. */
  getMode: () => NetworkSimulation;
  slowMs: number;
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DomainError('UNKNOWN', 'Request aborted'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DomainError('UNKNOWN', 'Request aborted'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });

/** Applies the current mode: 'slow' waits, 'fail' waits a little and throws NETWORK. */
const simulate = async (
  { getMode, slowMs }: NetworkSimulationConfig,
  signal?: AbortSignal,
): Promise<void> => {
  const mode = getMode();
  if (mode === 'slow') {
    await wait(slowMs, signal);
  } else if (mode === 'fail') {
    await wait(Math.min(slowMs, 600), signal);
    throw new DomainError('NETWORK', 'Simulated network failure');
  }
};

/** Dev decorator for the catalog: lets a reviewer reproduce success, slow and failure. */
export class SimulatedActivityDataSource implements ActivityDataSource {
  constructor(
    private readonly inner: ActivityDataSource,
    private readonly config: NetworkSimulationConfig,
  ) {}

  async getAll(signal?: AbortSignal): Promise<Activity[]> {
    await simulate(this.config, signal);
    return this.inner.getAll(signal);
  }
}

/** Dev decorator for refresh, same modes as the catalog. */
export class SimulatedActivityFeedDataSource implements ActivityFeedDataSource {
  constructor(
    private readonly inner: ActivityFeedDataSource,
    private readonly config: NetworkSimulationConfig,
  ) {}

  async fetchNew(signal?: AbortSignal): Promise<Activity> {
    await simulate(this.config, signal);
    return this.inner.fetchNew(signal);
  }
}
