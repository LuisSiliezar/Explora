import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@presentation/components';

interface Props {
  title: string;
  subtitle: string;
  /** Trailing control, usually a Toggle. */
  children: ReactNode;
  className?: string;
}

/** Title and subtitle on the left, a control on the right. */
export const SettingsRow = ({
  title,
  subtitle,
  children,
  className = '',
}: Props) => (
  <View
    className={`flex-row items-center justify-between gap-3.5 ${className}`}
  >
    <View className="flex-1 gap-[3px]">
      <Text className="font-sans-semibold text-lg">{title}</Text>
      <Text className="text-sm text-text-muted">{subtitle}</Text>
    </View>
    {children}
  </View>
);
