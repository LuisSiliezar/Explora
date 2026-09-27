import React, { memo } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import {
  usePressHaptic,
  type PressHaptic,
} from '@presentation/hooks/usePressHaptic';
import { useTheme } from '@presentation/theme';
import { Text } from './Text';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'destructive'
  | 'inverse'
  | 'link';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
  /** Tick on press. Pass `none` when the handler gives its own feedback. */
  haptic?: PressHaptic;
}

const container: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-pressed',
  secondary: 'border border-border active:border-text',
  danger: 'border border-danger-border bg-danger-surface active:opacity-80',
  destructive: 'bg-danger active:opacity-80',
  inverse: 'bg-inverse active:opacity-80',
  link: 'active:opacity-60',
};

const label: Record<ButtonVariant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-text',
  danger: 'text-danger',
  destructive: 'text-white',
  inverse: 'text-on-inverse',
  link: 'text-accent',
};

export const Button = memo(
  ({
    label: text,
    onPress,
    variant = 'primary',
    size = 'md',
    loading,
    disabled,
    accessibilityLabel,
    accessibilityHint,
    className = '',
    haptic = 'selection',
  }: Props) => {
    const { colors } = useTheme();
    const handlePress = usePressHaptic(haptic, onPress);
    const padding =
      variant === 'link'
        ? 'px-4 py-2'
        : size === 'md'
        ? 'px-4 py-4'
        : 'px-3.5 py-2.5';
    const rounded = size === 'md' ? 'rounded-[13px]' : 'rounded-[11px]';
    const textSize = size === 'md' ? 'text-lg' : 'text-base';
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? text}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: !!(disabled || loading),
          busy: !!loading,
        }}
        className={`items-center justify-center ${padding} ${rounded} ${
          container[variant]
        } ${disabled ? 'opacity-50' : ''} ${className}`}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? colors.onPrimary : colors.text}
          />
        ) : (
          <Text
            className={`font-display-semibold ${textSize} ${label[variant]}`}
          >
            {text}
          </Text>
        )}
      </Pressable>
    );
  },
);
