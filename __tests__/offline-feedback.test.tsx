import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useConnectivityToast } from '@presentation/hooks/useConnectivityToast';
import { strings } from '@presentation/i18n';
import { DependenciesProvider } from '@presentation/providers/DependenciesProvider';
import type { Dependencies } from '@config/di';
import { DomainError } from '@domain/errors';
import { queryKeys, useRefreshActivities } from '@presentation/hooks';
import {
  FailingActivityFeedDataSource,
  createActivityRepository,
  createFakeContainer,
  deferred,
  seedActivities,
} from './helpers/fakes';

// Toasts are rendered by sonner-native outside the Android accessibility tree, so
// Maestro can't assert them (see .maestro/05-offline-session.yaml). They're covered here.

const en = strings.en;

const setOnline = (online: boolean) =>
  ReactTestRenderer.act(() => {
    onlineManager.setOnline(online);
  });

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

/** No garbage-collection timers, so Jest can exit as soon as the tests finish. */
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity },
    },
  });

const render = (
  Probe: () => null,
  deps = createFakeContainer(),
  queryClient = createQueryClient(),
) => {
  deps.settingsStore.getState().setLanguage('en');
  ReactTestRenderer.act(() => {
    mounted.push(
      ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <DependenciesProvider value={deps}>
            <Probe />
          </DependenciesProvider>
        </QueryClientProvider>,
      ),
    );
  });
  return deps;
};

afterEach(() => {
  ReactTestRenderer.act(() => mounted.splice(0).forEach(r => r.unmount()));
});

beforeEach(() => {
  jest.clearAllMocks();
  onlineManager.setOnline(true);
});

describe('useConnectivityToast', () => {
  const Probe = () => {
    useConnectivityToast();
    return null;
  };

  it('stays silent on mount (the banner covers launch)', () => {
    onlineManager.setOnline(false);
    render(Probe);
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('warns with a haptic when going offline, and confirms on reconnect', () => {
    const deps = render(Probe);

    setOnline(false);
    expect(toast.warning).toHaveBeenCalledWith(en.toastOffline);
    expect(deps.haptics.warning).toHaveBeenCalledTimes(1);

    setOnline(true);
    expect(toast.success).toHaveBeenCalledWith(en.toastOnline);
  });
});

describe('useRefreshActivities', () => {
  const setup = (overrides: Partial<Dependencies> = {}) => {
    let result!: ReturnType<typeof useRefreshActivities>;
    const Probe = () => {
      result = useRefreshActivities();
      return null;
    };
    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.activities, seedActivities);
    const deps = render(Probe, createFakeContainer(overrides), queryClient);
    const refresh = () =>
      ReactTestRenderer.act(async () => {
        result.onRefresh();
      });
    const list = () =>
      queryClient.getQueryData<unknown[]>(queryKeys.activities);
    return { deps, refresh, list, queryClient };
  };

  it('refuses to refresh offline and says why', async () => {
    const { deps, refresh, list } = setup();
    setOnline(false);

    await refresh();

    expect(list()).toHaveLength(seedActivities.length);
    expect(toast.warning).toHaveBeenCalledWith(en.toastCantRefresh);
    expect(deps.haptics.warning).toHaveBeenCalled();
  });

  it('adds exactly one new activity and names it', async () => {
    const { refresh, list } = setup();

    await refresh();

    const items = list() as { id: string; title: string }[];
    expect(items).toHaveLength(seedActivities.length + 1);
    const added = items[items.length - 1];
    expect(added.id).toMatch(/^gen-/);
    expect(toast.success).toHaveBeenCalledWith(
      en.toastAdded.replace('%s', added.title),
    );
  });

  it('a failed refresh adds nothing, keeps the list and says so', async () => {
    const { deps, refresh, list } = setup({
      activities: createActivityRepository({
        feed: new FailingActivityFeedDataSource(
          new DomainError('NETWORK', 'down'),
        ),
      }),
    });

    await refresh();

    expect(list()).toEqual(seedActivities);
    expect(toast.error).toHaveBeenCalledWith(en.toastRefreshFailed);
    expect(deps.haptics.warning).toHaveBeenCalled();
  });

  it('ignores a second pull while one is running (no double add)', async () => {
    const pending = deferred<(typeof seedActivities)[number]>();
    const fetchNew = jest.fn(() => pending.promise);
    const { refresh, list } = setup({
      activities: createActivityRepository({ feed: { fetchNew } }),
    });

    await refresh();
    await refresh();
    expect(fetchNew).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      pending.resolve({ ...seedActivities[0], id: 'gen-late' });
    });
    expect(list()).toHaveLength(seedActivities.length + 1);
  });

  it('applies a late result after the screen is gone', async () => {
    const pending = deferred<(typeof seedActivities)[number]>();
    const { refresh, list } = setup({
      activities: createActivityRepository({
        feed: { fetchNew: () => pending.promise },
      }),
    });

    await refresh();
    ReactTestRenderer.act(() => mounted.splice(0).forEach(r => r.unmount()));
    await ReactTestRenderer.act(async () => {
      pending.resolve({ ...seedActivities[0], id: 'gen-after-unmount' });
    });

    const ids = (list() as { id: string }[]).map(item => item.id);
    expect(ids.filter(id => id === 'gen-after-unmount')).toHaveLength(1);
  });
});
