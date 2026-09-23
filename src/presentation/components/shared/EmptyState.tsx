import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface Props {
  icon?: IconName;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

export const EmptyState = ({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: Props) => (
  <Animated.View
    entering={FadeIn.duration(250)}
    className="flex-1 items-center justify-center gap-4 px-11 pb-10"
  >
    <View className="h-[90px] w-[90px] items-center justify-center rounded-full border border-border bg-field">
      {icon && <Icon name={icon} size={34} color="textFaint" />}
    </View>
    <Text
      accessibilityRole="header"
      className="text-center font-display-semibold text-2xl"
    >
      {title}
    </Text>
    <Text className="text-center text-lg text-text-muted">{body}</Text>
    <Button
      label={actionLabel}
      onPress={onAction}
      size="sm"
      className="px-[22px]"
    />
  </Animated.View>
);
