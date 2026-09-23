import React, { forwardRef, type ComponentRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@presentation/theme';
import { SectionLabel } from './SectionLabel';

interface Props extends TextInputProps {
  label: string;
  invalid?: boolean;
}

export type TextFieldRef = ComponentRef<typeof TextInput>;

export const TextField = forwardRef<TextFieldRef, Props>(
  ({ label, invalid, ...input }, ref) => {
    const { colors } = useTheme();
    return (
      <View className="gap-1.5">
        <SectionLabel>{label}</SectionLabel>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textFaint}
          className={`h-12 rounded-xl border bg-field px-3.5 font-sans text-[16px] text-text ${
            invalid ? 'border-danger' : 'border-border'
          }`}
          {...input}
        />
      </View>
    );
  },
);
