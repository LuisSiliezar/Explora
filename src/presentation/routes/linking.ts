import { Linking } from 'react-native';
import type { LinkingOptions } from '@react-navigation/native';
import type { LoggerPort, NotificationPort } from '@domain/services';
import type { RootStackParamList } from './types';

interface Options {
  /** `<APP_URL_SCHEME>://`, one per environment. */
  prefix: string;
  notifications: NotificationPort;
  logger: LoggerPort;
  /** Side effect for a tapped reminder (e.g. forget its id), before navigating. */
  onReminderOpened: (activityId: string) => void;
  /** False while the linked screens aren't mounted yet (onboarding); links are dropped. */
  isReady: () => boolean;
}

const activityPath = (id: string) => `activity/${encodeURIComponent(id)}`;

/**
 * One navigation path for everything outside the app: OS deep links and reminder taps
 * both become a URL that React Navigation resolves with `config`.
 * Links arriving before `isReady()` (onboarding not finished) are dropped.
 */
export const createLinking = ({
  prefix,
  notifications,
  logger,
  onReminderOpened,
  isReady,
}: Options): LinkingOptions<RootStackParamList> => {
  const reminderUrl = (activityId: string) =>
    `${prefix}${activityPath(activityId)}`;

  return {
    prefixes: [prefix],
    filter: () => isReady(),
    config: {
      // Keeps Tabs under a linked detail screen, so Back works after a cold start.
      initialRouteName: 'Tabs',
      screens: {
        Tabs: {
          screens: {
            Browse: 'browse',
            Search: 'search',
            Favorites: 'favorites',
            Settings: 'settings',
          },
        },
        ActivityDetail: 'activity/:id',
      },
    },
    async getInitialURL() {
      // A reminder tap wins: Android can hand a recreated task its old launch URL.
      const activityId = await notifications
        .getInitialOpenedActivity()
        .catch(error => {
          logger.warn('Reading the opening reminder failed', { error });
          return null;
        });
      if (activityId) {
        onReminderOpened(activityId);
        return reminderUrl(activityId);
      }
      return Linking.getInitialURL();
    },
    subscribe(listener) {
      const links = Linking.addEventListener('url', ({ url }) => listener(url));
      const unsubscribeReminders = notifications.onReminderOpened(
        activityId => {
          onReminderOpened(activityId);
          listener(reminderUrl(activityId));
        },
      );
      return () => {
        links.remove();
        unsubscribeReminders();
      };
    },
  };
};
