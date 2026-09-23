import React, { memo, type ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from './Text';

interface Props {
  /** notice: green dot (offline, saved) · danger: red (denied, blocked, errors). */
  tone: 'notice' | 'danger';
  title: string;
  body?: string;
  /** Edge-to-edge strip (top of screen) instead of a rounded card. */
  strip?: boolean;
  children?: ReactNode;
  className?: string;
}

export const Banner = memo(
  ({ tone, title, body, strip, children, className = '' }: Props) => {
    const colors =
      tone === 'notice'
        ? 'bg-success border-success-border'
        : 'bg-danger-surface border-danger-border';
    const shape = strip
      ? 'border-y px-5 py-[11px]'
      : 'rounded-xl border p-[13px]';
    return (
      <View
        accessibilityRole={tone === 'danger' ? 'alert' : 'summary'}
        className={`${colors} ${shape} ${className}`}
      >
        <View className="flex-row items-center gap-[9px]">
          {tone === 'notice' && (
            <View className="h-2 w-2 rounded-full bg-accent" />
          )}
          <Text
            className={`flex-1 text-[13px] ${
              body ? 'font-sans-bold text-[14px]' : 'font-sans-semibold'
            }`}
          >
            {title}
          </Text>
        </View>
        {body && (
          <Text className="mt-[9px] text-[13px] leading-[19px] text-text-muted">
            {body}
          </Text>
        )}
        {children}
      </View>
    );
  },
);
