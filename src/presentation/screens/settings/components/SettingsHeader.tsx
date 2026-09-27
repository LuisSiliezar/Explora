import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon, Text } from '@presentation/components';
import { usePressHaptic } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { enter } from '@presentation/theme';

interface Props {
  title: string;
  /** Sub-screens show a back chevron above the title. */
  onBack?: () => void;
}

/** The big page title of Settings and its sub-screens. */
export const SettingsHeader = ({ title, onBack }: Props) => {
  const t = useT();
  const handleBack = usePressHaptic('selection', () => onBack?.());
  return (
    <Animated.View entering={enter(0)} className="gap-6 pb-2">
      {onBack && (
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          testID="settings-back"
          className="self-start active:opacity-60"
        >
          <Icon name="back" size={26} />
        </Pressable>
      )}
      <Text
        accessibilityRole="header"
        className="font-display-bold text-5xl leading-tight tracking-tight"
      >
        {title}
      </Text>
    </Animated.View>
  );
};
