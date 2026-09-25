import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@presentation/components';
import { useT } from '@presentation/i18n';

interface Props {
  count: number;
  /** Clear all shows only when something is set. */
  hasFilters: boolean;
  onClearAll: () => void;
}

/** "N MATCHING ACTIVITIES" with a Clear all link. */
export const FilterSummary = ({ count, hasFilters, onClearAll }: Props) => {
  const t = useT();
  return (
    <View className="min-h-[20px] flex-row items-center justify-between gap-3 border-t border-border pt-3.5">
      <Text className="flex-1 font-sans-medium text-xs tracking-wide text-text-muted">
        {count} {t('matching')}
      </Text>
      {hasFilters && (
        <Pressable
          onPress={onClearAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('clearAll')}
        >
          <Text className="font-sans-semibold text-sm text-danger">
            {t('clearAll')}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
