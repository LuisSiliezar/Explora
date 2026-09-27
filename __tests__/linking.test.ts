import { Linking } from 'react-native';
import { getStateFromPath } from '@react-navigation/native';
import { createLinking } from '@presentation/routes/linking';
import { createFakeLogger, createFakeNotifications } from './helpers/fakes';

const prefix = 'explora-test://';

const setup = (ready = true) => {
  const notifications = createFakeNotifications();
  const onReminderOpened = jest.fn();
  const linking = createLinking({
    prefix,
    notifications,
    logger: createFakeLogger(),
    onReminderOpened,
    isReady: () => ready,
  });
  return { notifications, onReminderOpened, linking };
};

describe('deep linking', () => {
  afterEach(() => jest.restoreAllMocks());

  it('maps paths to screens', () => {
    const { linking } = setup();

    // Tabs stays underneath so Back has somewhere to go after a cold start.
    expect(getStateFromPath('activity/42', linking.config)?.routes).toEqual([
      expect.objectContaining({ name: 'Tabs' }),
      expect.objectContaining({ name: 'ActivityDetail', params: { id: '42' } }),
    ]);
    expect(
      getStateFromPath('favorites', linking.config)?.routes[0],
    ).toMatchObject({
      name: 'Tabs',
      state: { routes: [{ name: 'Favorites' }] },
    });
  });

  it('drops links until onboarding is done', () => {
    expect(setup(false).linking.filter?.(`${prefix}favorites`)).toBe(false);
    expect(setup(true).linking.filter?.(`${prefix}favorites`)).toBe(true);
  });

  it('prefers the reminder that launched the app over a stale OS URL', async () => {
    const { linking, notifications, onReminderOpened } = setup();
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(`${prefix}settings`);
    notifications.getInitialOpenedActivity.mockResolvedValueOnce('a b');

    expect(await linking.getInitialURL?.()).toBe(`${prefix}activity/a%20b`);
    expect(onReminderOpened).toHaveBeenCalledWith('a b');
  });

  it('falls back to the OS launch URL', async () => {
    const { linking, onReminderOpened } = setup();
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(`${prefix}settings`);

    expect(await linking.getInitialURL?.()).toBe(`${prefix}settings`);
    expect(onReminderOpened).not.toHaveBeenCalled();
  });

  it('turns reminder taps into URLs and cleans up', () => {
    const { linking, notifications, onReminderOpened } = setup();
    const unsubscribe = jest.fn();
    notifications.onReminderOpened.mockReturnValueOnce(unsubscribe);
    const listener = jest.fn();

    const cleanup = linking.subscribe?.(listener);
    const [[emit]] = notifications.onReminderOpened.mock.calls;
    emit('7');

    expect(onReminderOpened).toHaveBeenCalledWith('7');
    expect(listener).toHaveBeenCalledWith(`${prefix}activity/7`);
    cleanup?.();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
