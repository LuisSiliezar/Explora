import React from 'react';
import { View } from 'react-native';
import type { ActivityCategory, DurationFilter } from '@domain/entities';
import { Chip, SectionLabel } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { DurationSelector } from './DurationSelector';
import { FilterSummary } from './FilterSummary';

interface Props {
  allCategories: ActivityCategory[];
  categories: ActivityCategory[];
  onToggleCategory: (category: ActivityCategory) => void;
  duration: DurationFilter | null;
  onToggleDuration: (duration: DurationFilter) => void;
  resultCount: number;
  hasFilters: boolean;
  onClearAll: () => void;
}

/** The Search tab's inline filters: categories, duration and the match count. */
export const SearchFilters = ({
  allCategories,
  categories,
  onToggleCategory,
  duration,
  onToggleDuration,
  resultCount,
  hasFilters,
  onClearAll,
}: Props) => {
  const t = useT();
  return (
    <View className="gap-3.5">
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
        <DurationSelector
          duration={duration}
          onToggleDuration={onToggleDuration}
        />
      </View>

      <FilterSummary
        count={resultCount}
        hasFilters={hasFilters}
        onClearAll={onClearAll}
      />
    </View>
  );
};
