import React from 'react';
import { View } from 'react-native';
import { Text } from '@presentation/components';

/** Label and value on one line. */
export const StatRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between">
    <Text className="text-lg text-text-muted">{label}</Text>
    <Text className="font-sans-semibold text-lg">{value}</Text>
  </View>
);
