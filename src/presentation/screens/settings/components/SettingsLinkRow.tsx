import React from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { Icon, Text } from '@presentation/components';
import { usePressHaptic } from '@presentation/hooks';
import { STACKED_ROW_FONT_SCALE } from '../constants';

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
  // At the largest text sizes one word of the label can be wider than the space next to the
  // value, so the value moves under the label instead of breaking the word (ADR-007).
  const stacked = useWindowDimensions().fontScale >= STACKED_ROW_FONT_SCALE;
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      testID={testID}
      className="flex-row items-center gap-3 border-b border-border py-6 active:opacity-60"
    >
      <View
        className={
          stacked ? 'flex-1 gap-1' : 'flex-1 flex-row items-center gap-3'
        }
      >
        <Text className="flex-1 font-display-semibold text-xl">{label}</Text>
        {!!value && <Text className="text-lg text-text-muted">{value}</Text>}
      </View>
      <Icon name="forward" size={22} />
    </Pressable>
  );
};
