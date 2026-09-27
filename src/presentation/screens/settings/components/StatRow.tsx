import React from 'react';
import { View } from 'react-native';
import { Text } from '@presentation/components';

/** Label and value on one line. `testID` goes on the value (E2E reads it). */
export const StatRow = ({
  label,
  value,
  testID,
}: {
  label: string;
  value: string;
  testID?: string;
}) => (
  <View className="flex-row items-center justify-between gap-3">
    <Text className="flex-1 text-lg text-text-muted">{label}</Text>
    <Text
      testID={testID}
      className="shrink text-right font-sans-semibold text-lg"
    >
      {value}
    </Text>
  </View>
);
