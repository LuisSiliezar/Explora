import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, Text, type IconName } from '@presentation/components';
import { useDependencies, useSettings } from '@presentation/hooks';
import { useT, type StringKey } from '@presentation/i18n';
import type { RootStackScreenProps } from '@presentation/routes/types';
import { categoryColors, useTheme } from '@presentation/theme';

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

/** Pill that flips EN ⇄ ES (onboarding and auth). */
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

export const OnboardingScreen = ({
  navigation,
}: RootStackScreenProps<'Onboarding'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const tint = categoryColors(colors)[step.tint];
  const last = index === STEPS.length - 1;

  const toAuth = () => navigation.navigate('Auth', { from: 'onboarding' });

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
          onPress={toAuth}
          accessibilityRole="button"
          accessibilityLabel={t('skip')}
          hitSlop={8}
        >
          <Text className="font-sans-semibold text-[15px] text-text-muted">
            {t('skip')}
          </Text>
        </Pressable>
      </View>

      <Animated.View
        key={index}
        entering={FadeIn.duration(220)}
        className="flex-1 gap-[26px] p-5"
      >
        <View
          className="h-[320px] justify-between rounded-[20px] p-6"
          style={{ backgroundColor: tint.bg }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text
            className="font-mono text-[11px] tracking-[1.3px]"
            style={{ color: tint.fg }}
          >
            {t('stepOf', { n: index + 1 })}
          </Text>
          <View className="gap-2.5">
            {'text' in step.hero ? (
              <Text
                className="font-sans-bold text-[92px] leading-[88px] tracking-[-4px]"
                style={{ color: tint.fg }}
              >
                {step.hero.text}
              </Text>
            ) : (
              <Icon
                name={step.hero.icon}
                size={88}
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
          </View>
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
        <View className="gap-3">
          <Text
            accessibilityRole="header"
            className="font-sans-bold text-[28px] leading-[32px] tracking-[-0.5px]"
          >
            {t(step.title)}
          </Text>
          <Text className="text-[16px] leading-[24px] text-text-muted">
            {t(step.body)}
          </Text>
        </View>
      </Animated.View>

      <View className="gap-[18px] px-5">
        <View
          className="flex-row justify-center gap-[7px]"
          accessibilityLabel={t('stepOf', { n: index + 1 })}
        >
          {STEPS.map((_, dot) => (
            <View
              key={dot}
              className={`h-[7px] rounded-full ${
                dot === index ? 'w-[22px] bg-primary' : 'w-[7px] bg-border'
              }`}
            />
          ))}
        </View>
        <Button
          label={t(last ? 'getStarted' : 'next')}
          onPress={() => (last ? toAuth() : setIndex(index + 1))}
        />
      </View>
    </View>
  );
};
