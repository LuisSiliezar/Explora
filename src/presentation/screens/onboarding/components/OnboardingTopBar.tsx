import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { LanguagePill } from './LanguagePill';

/** Language pill on the left, Skip on the right. */
export const OnboardingTopBar = ({ onSkip }: { onSkip: () => void }) => {
  const t = useT();
  return (
    <View className="flex-row items-center justify-between px-5 pt-[18px]">
      <LanguagePill />
      <Pressable
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel={t('skip')}
        testID="onboarding-skip"
        hitSlop={8}
      >
        <Text className="font-sans-semibold text-lg text-text-muted">
          {t('skip')}
        </Text>
      </Pressable>
    </View>
  );
};
