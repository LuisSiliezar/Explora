/* Native module mocks: tests exercise JS logic through fakes, never real native code. */
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('@notifee/react-native', () =>
  require('@notifee/react-native/jest-mock'),
);
jest.mock('react-native-config', () => ({}));
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    createMMKV: () => ({
      getString: key => store.get(key),
      set: (key, value) => store.set(key, value),
      remove: key => store.delete(key),
    }),
  };
});
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({ didCancel: true })),
  launchImageLibrary: jest.fn(async () => ({ didCancel: true })),
}));
jest.mock('@react-native-community/geolocation', () => ({
  requestAuthorization: jest.fn(success => success()),
  getCurrentPosition: jest.fn(success =>
    success({ coords: { latitude: 0, longitude: 0 } }),
  ),
}));

/* UI libraries added with the Claude Design implementation. */
require('react-native-gesture-handler/jestSetup');
// Gesture Handler v3 asks Worklets for the UI runtime on load; jest has none.
jest.mock('react-native-worklets', () => ({
  ...jest.requireActual('react-native-worklets'),
  getUIRuntimeHolder: () => undefined,
}));
require('react-native-reanimated').setUpTests();
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  default: { trigger: jest.fn() },
}));
jest.mock('react-native-bootsplash', () => ({
  __esModule: true,
  default: {
    hide: jest.fn(async () => undefined),
    isVisible: jest.fn(() => false),
  },
}));
jest.mock('lottie-react-native', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View };
});
jest.mock('sonner-native', () => ({
  toast: jest.fn(),
  Toaster: () => null,
}));
// SafeAreaProvider renders nothing until it has insets; the mock provides fixed metrics.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
