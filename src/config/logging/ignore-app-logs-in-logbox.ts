import { LogBox } from 'react-native';

/** Every line ConsoleLogger prints starts with this. */
const APP_LOG_PREFIX = '[Explora]';

/**
 * Dev only: our own log lines stay in the console but don't pop LogBox banners.
 * Handled failures (offline, corrupt storage) would otherwise cover the tab bar and
 * break the e2e flows that fail on purpose. Real crashes still reach LogBox.
 */
export const ignoreAppLogsInLogBox = (): void => {
  if (__DEV__) {
    LogBox.ignoreLogs([APP_LOG_PREFIX]);
  }
};
