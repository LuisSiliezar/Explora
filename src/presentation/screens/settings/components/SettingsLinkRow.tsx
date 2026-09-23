import React from 'react';
import { Pressable } from 'react-native';
import { Icon, Text } from '@presentation/components';
import { usePressHaptic } from '@presentation/hooks';

interface Props {
  label: string;
  /** Current value, shown muted before the chevron. */
  value?: string;
  onPress: () => void;
  testID?: string;
}

/** A full-width Settings row: label, current value and a chevron. Pushes a sub-screen. */
export const SettingsLinkRow = ({ label, value, onPress, testID }: Props) => {
  const handlePress = usePressHaptic('selection', onPress);
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      testID={testID}
      className="flex-row items-center gap-3 border-b border-border py-6 active:opacity-60"
    >
      <Text
        numberOfLines={1}
        className="flex-1 font-display-semibold text-xl"
      >
        {label}
      </Text>
      {!!value && (
        <Text numberOfLines={1} className="text-lg text-text-muted">
          {value}
        </Text>
      )}
      <Icon name="forward" size={22} />
    </Pressable>
  );
};
