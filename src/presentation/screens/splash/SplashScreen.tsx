import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import LottieView from 'lottie-react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { useActivities } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import splashAnimation from '@assets/lottie/splash.json';

const MIN_VISIBLE_MS = 1200;
/** Must match `--logo-width` of the BootSplash generator so the handoff doesn't jump. */
const LOGO_SIZE = 192;

/**
 * Picks up where the native BootSplash leaves off (same logo, same spot, always white), loops the
 * needle spin while the catalog loads, then fades out over the app. Errors still finish: Browse
 * shows its error state.
 */
export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const t = useT();
  const { isPending } = useActivities();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    BootSplash.hide({ fade: true }).catch(() => undefined);
    const timer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minElapsed && !isPending) {
      onFinish();
    }
  }, [minElapsed, isPending, onFinish]);

  return (
    <Animated.View
      exiting={FadeOut.duration(250)}
      style={StyleSheet.absoluteFill}
      className="z-50 items-center justify-center bg-white"
      accessibilityLabel={`Explora. ${t('loadingCatalog')}`}
      testID="splash"
    >
      <LottieView source={splashAnimation} autoPlay loop style={styles.logo} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
});
