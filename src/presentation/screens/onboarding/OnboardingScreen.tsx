import React from 'react';
import { View } from 'react-native';
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

  // The navigator swaps to the app once onboarding is done.
  const finish = () => settingsStore.getState().completeOnboarding();

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 34),
      }}
    >
      <OnboardingTopBar onSkip={finish} />

      <Animated.ScrollView
        ref={pager.scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={pager.onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={pager.onMomentumScrollEnd}
        className="flex-1"
      >
        {STEPS.map((s, i) => (
          <OnboardingPage
            key={s.title}
            step={s}
            n={i + 1}
            width={pager.width}
            scrollX={pager.scrollX}
          />
        ))}
      </Animated.ScrollView>

      <View className="gap-[18px] px-5">
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
