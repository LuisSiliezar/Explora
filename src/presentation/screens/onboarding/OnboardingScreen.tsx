import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@presentation/components';
import { useDependencies } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import type { RootStackScreenProps } from '@presentation/routes/types';
import { OnboardingPage, OnboardingTopBar, PagerDot } from './components';
import { STEPS } from './constants';
import { useOnboardingPager } from './hooks';

export const OnboardingScreen = (
  _props: RootStackScreenProps<'Onboarding'>,
) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { settingsStore } = useDependencies();
  const pager = useOnboardingPager();
  // The page text sits just above the footer, whatever its height (text size).
  const [footerHeight, setFooterHeight] = useState(0);

  // The navigator swaps to the app once onboarding is done.
  const finish = () => settingsStore.getState().completeOnboarding();

  return (
    <View
      className="flex-1 bg-inverse"
      style={{
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 34),
      }}
    >
      <StatusBar barStyle="light-content" />

      {/* Full-screen pager behind the top bar and footer. */}
      <Animated.ScrollView
        ref={pager.scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={pager.onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={pager.onMomentumScrollEnd}
        className="absolute inset-0"
      >
        {STEPS.map((s, i) => (
          <OnboardingPage
            key={s.title}
            step={s}
            n={i + 1}
            width={pager.width}
            bottomInset={footerHeight + Math.max(insets.bottom, 34)}
            scrollX={pager.scrollX}
          />
        ))}
      </Animated.ScrollView>

      <OnboardingTopBar onSkip={finish} />

      {/* Lets swipes in the middle reach the pager. */}
      <View className="flex-1" pointerEvents="none" />

      <View
        className="gap-[18px] px-5"
        pointerEvents="box-none"
        onLayout={e => setFooterHeight(e.nativeEvent.layout.height)}
      >
        <View
          className="flex-row justify-center gap-[7px]"
          accessibilityLabel={t('stepOf', { n: pager.index + 1 })}
        >
          {STEPS.map((s, i) => (
            <PagerDot
              key={s.title}
              i={i}
              width={pager.width}
              scrollX={pager.scrollX}
            />
          ))}
        </View>
        <Button
          label={t(pager.last ? 'getStarted' : 'next')}
          onPress={pager.last ? finish : pager.next}
        />
      </View>
    </View>
  );
};
