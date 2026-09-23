/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { registerNotificationBackgroundHandler } from '@infrastructure/services';
import App from './App';
import { name as appName } from './app.json';

// notifee needs this before the app registers (reminder taps are handled in the app).
registerNotificationBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
