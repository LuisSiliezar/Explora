import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

interface Props {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  code?: string;
}

export const ErrorState = ({
  title,
  body,
  retryLabel,
  onRetry,
  secondaryLabel,
  onSecondary,
  code,
}: Props) => (
  <Animated.View
    entering={FadeIn.duration(250)}
    className="flex-1 items-center justify-center gap-4 px-11 pb-10"
  >
    <View className="h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-danger-border bg-danger-surface">
      <Icon name="alert" size={26} color="danger" />
    </View>
    <Text
      accessibilityRole="header"
      className="text-center font-sans-semibold text-[20px]"
    >
      {title}
    </Text>
    <Text className="text-center text-[15px] leading-[22px] text-text-muted">
      {body}
    </Text>
    <View className="gap-2.5 self-stretch">
      <Button label={retryLabel} onPress={onRetry} size="sm" />
      {secondaryLabel && onSecondary && (
        <Button
          label={secondaryLabel}
          onPress={onSecondary}
          variant="secondary"
          size="sm"
        />
      )}
    </View>
    {code && (
      <Text className="font-mono text-[11px] tracking-[0.6px] text-text-muted">
        {code}
      </Text>
    )}
  </Animated.View>
);
