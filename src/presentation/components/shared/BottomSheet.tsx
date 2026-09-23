import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}

/** Slide-up sheet over a dimmed backdrop (filter + language sheets). */
export const BottomSheet = ({
  visible,
  onClose,
  closeLabel,
  children,
}: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-black/40"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <Animated.View
          entering={SlideInDown.duration(240)}
          accessibilityViewIsModal
          className="gap-4 rounded-t-[22px] bg-raised p-5"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="h-1 w-9 self-center rounded-full bg-border" />
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
