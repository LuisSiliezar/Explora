import './global.css';
import React from 'react';
import { LogBox } from 'react-native';
import { AppProviders } from '@presentation/providers';
import { AppRoot } from '@presentation/routes';

// Dev-only warnings from libraries, not from our code:
// - NativeWind (react-native-css-interop) registers every core component, including the
//   deprecated ImageBackground. We never use it.
// - sonner-native passes dependency arrays to Reanimated hooks (ignored on native).
// - Metro's Fast Refresh socket drops whenever the device goes offline (e.g. testing
//   offline mode on an emulator). The "Fast Refresh disconnected" banner still shows.
LogBox.ignoreLogs([
  'ImageBackground is deprecated',
  '[Reanimated] Dependencies should only be used on the web',
  'Cannot connect to Metro',
  'Disconnected from Metro',
]);

const App = () => (
  <AppProviders>
    <AppRoot />
  </AppProviders>
);

export default App;
