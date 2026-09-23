import React, { type ReactNode } from 'react';
import { Modal, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, type ButtonVariant } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
}

interface Props {
  visible: boolean;
  title: string;
  body: string;
  icon?: ReactNode;
  actions: DialogAction[];
  /** Back button / tap outside on Android. */
  onRequestClose: () => void;
}

/** Centered alert used for permission pre-prompts and confirmations. */
export const Dialog = ({
  visible,
  title,
  body,
  icon,
  actions,
  onRequestClose,
}: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onRequestClose}
  >
    <View className="flex-1 items-center justify-center bg-black/45 p-7">
      <Animated.View
        entering={FadeInDown.duration(200)}
        accessibilityViewIsModal
        className="w-full max-w-[360px] items-center gap-3.5 rounded-[18px] bg-raised p-6"
      >
        {icon}
        <Text
          accessibilityRole="header"
          className="text-center font-display-bold text-xl tracking-tight"
        >
          {title}
        </Text>
        <Text className="text-center text-base text-text-muted">{body}</Text>
        <View className="mt-1 gap-[9px] self-stretch">
          {actions.map(action => (
            <Button
              key={action.label}
              label={action.label}
              onPress={action.onPress}
              variant={action.variant ?? 'secondary'}
              size="sm"
            />
          ))}
        </View>
      </Animated.View>
    </View>
  </Modal>
);

/** The round green badge at the top of permission dialogs. */
export const DialogBadge = ({ icon }: { icon?: IconName }) => (
  <View className="h-12 w-12 items-center justify-center rounded-full bg-success">
    {icon ? (
      <Icon name={icon} size={22} color="accent" />
    ) : (
      <View className="h-3.5 w-3.5 rounded-full bg-accent" />
    )}
  </View>
);
