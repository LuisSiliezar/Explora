import React, { useEffect, useRef, type ComponentRef } from 'react';
import { Keyboard, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Icon, MAX_FONT_SCALE } from '@presentation/components';
import { useT } from '@presentation/i18n';
import type { TabParamList } from '@presentation/routes/types';
import { useTheme } from '@presentation/theme';

interface Props {
  query: string;
  onChangeQuery: (query: string) => void;
}

/**
 * The Search tab's live input: a pill with a clear button. It focuses when you enter the tab
 * (first visit or a tap on the tab), not when you come back from a detail screen: the keyboard
 * would cover the floating tab bar.
 */
export const SearchField = ({ query, onChangeQuery }: Props) => {
  const t = useT();
  const { colors } = useTheme();
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  const navigation =
    useNavigation<BottomTabNavigationProp<TabParamList, 'Search'>>();

  useEffect(
    () => navigation.addListener('tabPress', () => input.current?.focus()),
    [navigation],
  );

  return (
    <Pressable
      onPress={() => input.current?.focus()}
      accessible={false}
      className="min-h-[54px] flex-row items-center gap-3 rounded-full border-2 border-text-muted bg-field px-5"
    >
      <Icon name="search" size={20} />
      <TextInput
        ref={input}
        autoFocus
        value={query}
        onChangeText={onChangeQuery}
        testID="search-input"
        placeholder={t('searchPlaceholder')}
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={Keyboard.dismiss}
        accessibilityLabel={t('searchPlaceholder')}
        // Same cap as components/shared/Text (ADR-007); the pill grows instead of clipping.
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        className="flex-1 py-3 font-sans text-lg text-text"
      />
      {!!query && (
        <Pressable
          onPress={() => onChangeQuery('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('clearSearch')}
        >
          <Icon name="close" size={18} color="textMuted" />
        </Pressable>
      )}
    </Pressable>
  );
};
