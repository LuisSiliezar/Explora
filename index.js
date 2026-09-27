/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { ignoreAppLogsInLogBox } from '@config/logging';
import { registerNotificationBackgroundHandler } from '@infrastructure/services';
import App from './App';
import { name as appName } from './app.json';

// notifee needs this before the app registers (reminder taps are handled in the app).
registerNotificationBackgroundHandler();
// Dev: [Explora] log lines print to the console without LogBox banners.
ignoreAppLogsInLogBox();

AppRegistry.registerComponent(appName, () => App);
