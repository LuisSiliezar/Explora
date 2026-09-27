import React from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { enter } from '@presentation/theme';

interface Props {
  count: number;
  editing: boolean;
  /** Hidden when there is nothing to edit. */
  onToggleEditing?: () => void;
}

/** Title, saved count and the Edit/Done switch. */
export const FavoritesHeader = ({ count, editing, onToggleEditing }: Props) => {
  const t = useT();
  return (
    <Animated.View
      entering={enter(0)}
      className="flex-row items-baseline justify-between px-5 pb-3.5 pt-3"
    >
      <View className="gap-1">
        <Text
          accessibilityRole="header"
          className="font-display-bold text-3xl tracking-tight"
        >
          {t('favorites')}
        </Text>
        <Text className="font-sans-medium text-base text-text-muted">
          {count} {t('saved')}
        </Text>
      </View>
      {onToggleEditing && (
        <Pressable
          onPress={onToggleEditing}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t(editing ? 'done' : 'edit')}
        >
          <Text className="font-sans-semibold text-lg text-accent">
            {t(editing ? 'done' : 'edit')}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
};
