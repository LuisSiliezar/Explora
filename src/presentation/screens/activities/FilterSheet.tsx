import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import type { ActivityCategory, DurationFilter } from '@domain/entities';
import {
  BottomSheet,
  Button,
  Chip,
  Icon,
  SectionLabel,
  Text,
} from '@presentation/components';
import { useT, type StringKey } from '@presentation/i18n';
import { useTheme } from '@presentation/theme';

const DURATIONS: { value: DurationFilter; label: StringKey }[] = [
  { value: 'short', label: 'durShort' },
  { value: 'mid', label: 'durMid' },
  { value: 'long', label: 'durLong' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  query: string;
  onChangeQuery: (query: string) => void;
  allCategories: ActivityCategory[];
  categories: ActivityCategory[];
  onToggleCategory: (category: ActivityCategory) => void;
  duration: DurationFilter | null;
  onToggleDuration: (duration: DurationFilter) => void;
  onClearAll: () => void;
  resultCount: number;
}

export const FilterSheet = ({
  visible,
  onClose,
  query,
  onChangeQuery,
  allCategories,
  categories,
  onToggleCategory,
  duration,
  onToggleDuration,
  onClearAll,
  resultCount,
}: Props) => {
  const t = useT();
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={t('cancel')}>
      <View className="flex-row items-center gap-3">
        <View className="h-[46px] flex-1 flex-row items-center gap-2.5 rounded-xl border border-text px-3.5">
          <View className="h-[13px] w-[13px] rounded-full border-2 border-text" />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            testID="search-input"
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textFaint}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onClose}
            accessibilityLabel={t('searchPlaceholder')}
            className="h-full flex-1 font-sans text-[15px] text-text"
          />
          {!!query && (
            <Pressable
              onPress={() => onChangeQuery('')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('clearSearch')}
            >
              <Icon name="close" size={16} color="textMuted" />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('cancel')}
          hitSlop={8}
        >
          <Text className="font-sans-semibold text-[15px] text-accent">
            {t('cancel')}
          </Text>
        </Pressable>
      </View>

      <View className="gap-2.5">
        <SectionLabel>{t('category')}</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {allCategories.map(category => (
            <Chip
              key={category}
              label={category}
              size="sm"
              selected={categories.includes(category)}
              onPress={() => onToggleCategory(category)}
            />
          ))}
        </View>
      </View>

      <View className="gap-2.5">
        <SectionLabel>{t('duration')}</SectionLabel>
        <View className="flex-row gap-2">
          {DURATIONS.map(option => {
            const selected = duration === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onToggleDuration(option.value)}
                accessibilityRole="button"
                accessibilityLabel={t(option.label)}
                accessibilityState={{ selected }}
                className={`flex-1 items-center rounded-[10px] border border-border py-2.5 ${
                  selected ? 'bg-inverse' : 'bg-raised'
                }`}
              >
                <Text
                  className={`font-sans-semibold text-[13px] ${
                    selected ? 'text-on-inverse' : 'text-text'
                  }`}
                >
                  {t(option.label)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-border pt-3.5">
        <Text className="font-mono text-[11px] tracking-[0.4px] text-text-muted">
          {resultCount} {t('matching')}
        </Text>
        <Pressable
          onPress={onClearAll}
          accessibilityRole="button"
          accessibilityLabel={t('clearAll')}
          hitSlop={8}
        >
          <Text className="font-sans-semibold text-[13px] text-danger">
            {t('clearAll')}
          </Text>
        </Pressable>
      </View>

      <Button
        label={
          resultCount ? t('showResults', { n: resultCount }) : t('noMatches')
        }
        onPress={onClose}
        size="sm"
      />
    </BottomSheet>
  );
};
