import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@presentation/components';
import { useT } from '@presentation/i18n';

/** Skip on the right, over the photo. */
export const OnboardingTopBar = ({ onSkip }: { onSkip: () => void }) => {
  const t = useT();
  return (
    <View className="flex-row justify-end px-5 pt-[18px]">
      <Pressable
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel={t('skip')}
        testID="onboarding-skip"
        hitSlop={8}
      >
        <Text className="font-sans-semibold text-lg text-on-photo">
          {t('skip')}
        </Text>
      </Pressable>
    </View>
  );
};
