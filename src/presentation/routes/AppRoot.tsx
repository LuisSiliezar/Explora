import React, { useCallback, useState } from 'react';
import { SplashScreen } from '@presentation/screens/splash/SplashScreen';
import { RootNavigator } from './RootNavigator';

/** The navigator mounts right away (so the catalog starts loading) under the animated splash. */
export const AppRoot = () => {
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);
  return (
    <>
      <RootNavigator />
      {!splashDone && <SplashScreen onFinish={finishSplash} />}
    </>
  );
};
