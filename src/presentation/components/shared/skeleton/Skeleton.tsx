import React, { createContext, useContext, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useT } from '@presentation/i18n/useT';
import { useTheme } from '@presentation/theme';

const SWEEP_MS = 1200;
/** Width of the highlight band, as a share of the screen width. */
const BAND = 0.6;

/** One 0→1 progress value shared by every block in a group, so they sweep in step. */
const ShimmerContext = createContext<SharedValue<number> | null>(null);

interface GroupProps {
  children: React.ReactNode;
  className?: string;
  testID?: string;
}

/** Wraps a loading placeholder: drives the sweep and announces "Loading". */
export const SkeletonGroup = ({ children, className, testID }: GroupProps) => {
  const t = useT();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: SWEEP_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
    );
    return () => cancelAnimation(progress);
  }, [progress, reducedMotion]);

  return (
    <ShimmerContext.Provider value={reducedMotion ? null : progress}>
      <View
        className={className}
        accessibilityRole="progressbar"
        accessibilityLabel={t('loading')}
        testID={testID}
      >
        {children}
      </View>
    </ShimmerContext.Provider>
  );
};

interface BlockProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** A placeholder shape. Size and radius come from `className`. */
export const SkeletonBlock = ({ className = '', style }: BlockProps) => {
  const progress = useContext(ShimmerContext);
  return (
    <View className={`overflow-hidden bg-skeleton ${className}`} style={style}>
      {progress && <Sweep progress={progress} />}
    </View>
  );
};

const Sweep = ({ progress }: { progress: SharedValue<number> }) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const band = width * BAND;
  const gradient = useMemo(
    () => ({
      width: band,
      backgroundImage: `linear-gradient(90deg, ${colors.skeletonHighlight}00, ${colors.skeletonHighlight}, ${colors.skeletonHighlight}00)`,
    }),
    [band, colors.skeletonHighlight],
  );
  const move = useAnimatedStyle(() => ({
    transform: [{ translateX: -band + progress.value * (width + band) }],
  }));
  return <Animated.View style={[styles.sweep, gradient, move]} />;
};

const styles = StyleSheet.create({
  sweep: { position: 'absolute', top: 0, bottom: 0, left: 0 },
});
