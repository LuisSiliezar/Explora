import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useIsOnline } from '@presentation/hooks/useIsOnline';
import { Banner } from './Banner';

/** Top-of-screen strip shown only while offline. */
export const OfflineBanner = ({ message }: { message: string }) => {
  const online = useIsOnline();
  if (online) {
    return null;
  }
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      // Keep the node in the native tree so e2e can find it by id.
      collapsable={false}
      testID="offline-banner"
    >
      <Banner tone="notice" title={message} strip />
    </Animated.View>
  );
};
