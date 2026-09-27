import React from 'react';
import { ScrollView } from 'react-native';
import type { ActivityCategory, PermissionStatus } from '@domain/entities';
import { Chip } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { nearMeDot } from '../utils';

interface Props {
  nearMeActive: boolean;
  permission: PermissionStatus;
  onPressNearMe: () => void;
  allCategories: ActivityCategory[];
  categories: ActivityCategory[];
  onToggleCategory: (category: ActivityCategory) => void;
}

/** Horizontal chip row: "Near me" first, then one chip per category. */
export const CategoryChips = ({
  nearMeActive,
  permission,
  onPressNearMe,
  allCategories,
  categories,
  onToggleCategory,
}: Props) => {
  const t = useT();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      <Chip
        label={t('nearMe')}
        selected={nearMeActive}
        onPress={onPressNearMe}
        dot={nearMeDot(nearMeActive, permission)}
      />
      {allCategories.map(category => (
        <Chip
          key={category}
          label={category}
          selected={categories.includes(category)}
          onPress={() => onToggleCategory(category)}
        />
      ))}
    </ScrollView>
  );
};
