import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { onlineManager } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useConnectivityToast } from '@presentation/hooks/useConnectivityToast';
import { strings } from '@presentation/i18n';
import { DependenciesProvider } from '@presentation/providers/DependenciesProvider';
import { useRefreshActivities } from '@presentation/screens/activities/hooks';
import { createFakeContainer } from './helpers/fakes';

// Toasts are rendered by sonner-native outside the Android accessibility tree, so
// Maestro can't assert them (see .maestro/05-offline-session.yaml). They're covered here.

const en = strings.en;

const setOnline = (online: boolean) =>
  ReactTestRenderer.act(() => {
    onlineManager.setOnline(online);
  });

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const render = (Probe: () => null) => {
  const deps = createFakeContainer();
  deps.settingsStore.getState().setLanguage('en');
  ReactTestRenderer.act(() => {
    mounted.push(
      ReactTestRenderer.create(
        <DependenciesProvider value={deps}>
          <Probe />
        </DependenciesProvider>,
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
  const setup = (refetch: () => Promise<unknown>) => {
    let result!: ReturnType<typeof useRefreshActivities>;
    const Probe = () => {
      result = useRefreshActivities(refetch);
      return null;
    };
    const deps = render(Probe);
    return { deps, refresh: () => result.onRefresh() };
  };

  it('refuses to refresh offline and says why', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    const { deps, refresh } = setup(refetch);
    setOnline(false);

    await ReactTestRenderer.act(refresh);

    expect(refetch).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalledWith(en.toastCantRefresh);
    expect(deps.haptics.warning).toHaveBeenCalled();
  });

  it('refetches and confirms when online', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    const { refresh } = setup(refetch);

    await ReactTestRenderer.act(refresh);

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(en.toastUpdated);
  });
});
