import React, { memo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, Text, type IconName } from '@presentation/components';
import { useDependencies, useSettings } from '@presentation/hooks';
import { useT, type StringKey } from '@presentation/i18n';
import type { RootStackScreenProps } from '@presentation/routes/types';
import {
  categoryColors,
  categoryImage,
  enter,
  useTheme,
} from '@presentation/theme';

interface Step {
  title: StringKey;
  body: StringKey;
  note: StringKey;
  /** Big number or icon at the top of the step card. */
  hero: { text: string } | { icon: IconName };
  tint: 'Outdoors' | 'Culture' | 'Leisure';
}

const STEPS: Step[] = [
  {
    title: 'ob1Title',
    body: 'ob1Body',
    note: 'ob1Note',
    hero: { text: '12' },
    tint: 'Outdoors',
  },
  {
    title: 'ob2Title',
    body: 'ob2Body',
    note: 'ob2Note',
    hero: { icon: 'heart' },
    tint: 'Culture',
  },
  {
    title: 'ob3Title',
    body: 'ob3Body',
    note: 'ob3Note',
    hero: { icon: 'location' },
    tint: 'Leisure',
  },
];

const BARS = [
  { width: '64%', opacity: 0.9 },
  { width: '40%', opacity: 0.55 },
  { width: '22%', opacity: 0.3 },
] as const;

/** Pill that flips EN ⇄ ES. */
export const LanguagePill = () => {
  const { settingsStore, haptics } = useDependencies();
  const language = useSettings(state => state.language);
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        settingsStore.getState().setLanguage(language === 'en' ? 'es' : 'en');
      }}
      accessibilityRole="button"
      accessibilityLabel={
        language === 'en' ? 'Language: English' : 'Idioma: Español'
      }
      className="flex-row items-center gap-1.5 rounded-full border border-border px-3 py-[7px] active:border-text"
    >
      <Text className="font-sans-semibold text-[13px]">
        {language.toUpperCase()}
      </Text>
      <Icon name="chevronDown" size={14} />
    </Pressable>
  );
};

/** How far the hero photo drifts (fraction of the page width) while swiping. */
const PARALLAX = 0.3;

/** Scroll offsets where page `i` is one page left, centred, one page right. */
const pageRange = (i: number, width: number) => {
  'worklet';
  return [(i - 1) * width, i * width, (i + 1) * width];
};

/** Pager dot: stretches and turns green as its page scrolls into place. */
const Dot = memo(
  ({
    i,
    width,
    scrollX,
  }: {
    i: number;
    width: number;
    scrollX: SharedValue<number>;
  }) => {
    const { colors } = useTheme();
    const style = useAnimatedStyle(() => {
      const range = pageRange(i, width);
      return {
        width: interpolate(scrollX.value, range, [7, 22, 7], 'clamp'),
        backgroundColor: interpolateColor(scrollX.value, range, [
          colors.border,
          colors.primary,
          colors.border,
        ]),
      };
    });
    return <Animated.View className="h-[7px] rounded-full" style={style} />;
  },
);

/** One onboarding step: photo hero card with a tinted panel, title and body. */
const OnboardingPage = memo(
  ({
    step,
    n,
    width,
    scrollX,
  }: {
    step: Step;
    n: number;
    width: number;
    scrollX: SharedValue<number>;
  }) => {
    const t = useT();
    const { colors } = useTheme();
    const tint = categoryColors(colors)[step.tint];
    const parallax = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            pageRange(n - 1, width),
            [-width * PARALLAX, 0, width * PARALLAX],
            'clamp',
          ),
        },
      ],
    }));
    return (
      <View className="gap-[26px] p-5" style={{ width }}>
        <View
          className="h-[320px] overflow-hidden rounded-[20px]"
          style={{ backgroundColor: tint.bg }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Animated.Image
            source={categoryImage(step.tint)}
            resizeMode="cover"
            style={[styles.photo, parallax]}
          />
          <View className="flex-1 justify-between p-4">
            <View
              className="self-start rounded-full px-2.5 py-1"
              style={{ backgroundColor: tint.bg }}
            >
              <Text
                className="font-mono text-[11px] tracking-[1.3px]"
                style={{ color: tint.fg }}
              >
                {t('stepOf', { n })}
              </Text>
            </View>
            <View
              className="gap-2.5 rounded-[14px] p-4"
              style={{ backgroundColor: tint.bg }}
            >
              {'text' in step.hero ? (
                <Text
                  className="font-sans-bold text-[56px] leading-[56px] tracking-[-2.5px]"
                  style={{ color: tint.fg }}
                >
                  {step.hero.text}
                </Text>
              ) : (
                <Icon
                  name={step.hero.icon}
                  size={52}
                  strokeWidth={1.75}
                  colorValue={tint.fg}
                />
              )}
              <Text
                className="font-mono text-[11px] tracking-[1.5px]"
                style={{ color: tint.fg }}
              >
                {t(step.note)}
              </Text>
              <View className="gap-1.5">
                {BARS.map(bar => (
                  <View
                    key={bar.width}
                    className="h-1 rounded-sm"
                    style={{
                      width: bar.width,
                      opacity: bar.opacity,
                      backgroundColor: tint.fg,
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
        <Animated.View entering={enter(1)} className="gap-3">
          <Text
            accessibilityRole="header"
            className="font-sans-bold text-[28px] leading-[32px] tracking-[-0.5px]"
          >
            {t(step.title)}
          </Text>
          <Text className="text-[16px] leading-[24px] text-text-muted">
            {t(step.body)}
          </Text>
        </Animated.View>
      </View>
    );
  },
);

export const OnboardingScreen = (
  _props: RootStackScreenProps<'Onboarding'>,
) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { settingsStore } = useDependencies();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const last = index === STEPS.length - 1;

  const onScroll = useAnimatedScrollHandler(e => {
    scrollX.value = e.contentOffset.x;
  });

  // The navigator swaps to the app once onboarding is done.
  const finish = () => settingsStore.getState().completeOnboarding();

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const next = () => {
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    setIndex(index + 1);
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 34),
      }}
    >
      <View className="flex-row items-center justify-between px-5 pt-[18px]">
        <LanguagePill />
        <Pressable
          onPress={finish}
          accessibilityRole="button"
          accessibilityLabel={t('skip')}
          hitSlop={8}
        >
          <Text className="font-sans-semibold text-[15px] text-text-muted">
            {t('skip')}
          </Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        className="flex-1"
      >
        {STEPS.map((s, i) => (
          <OnboardingPage
            key={s.title}
            step={s}
            n={i + 1}
            width={width}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      <View className="gap-[18px] px-5">
        <View
          className="flex-row justify-center gap-[7px]"
          accessibilityLabel={t('stepOf', { n: index + 1 })}
        >
          {STEPS.map((s, i) => (
            <Dot key={s.title} i={i} width={width} scrollX={scrollX} />
          ))}
        </View>
        <Button
          label={t(last ? 'getStarted' : 'next')}
          onPress={last ? finish : next}
        />
      </View>
    </View>
  );
};

// Bundled images default to their file's size: pin both dimensions so the photo fills its
// (unpadded) container. It overhangs both sides by the parallax travel so no edge shows.
const styles = StyleSheet.create({
  photo: {
    position: 'absolute',
    top: 0,
    left: `${-PARALLAX * 100}%`,
    width: `${100 + PARALLAX * 200}%`,
    height: '100%',
  },
});
