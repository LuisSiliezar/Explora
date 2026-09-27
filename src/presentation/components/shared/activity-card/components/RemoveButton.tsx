import React from 'react';
import { Pressable } from 'react-native';
import { useT } from '@presentation/i18n/useT';
import { Text } from '../../Text';

interface Props {
  title: string;
  onPress: () => void;
  testID?: string;
}

/** Favorites edit mode: replaces the heart on each row. */
export const RemoveButton = ({ title, onPress, testID }: Props) => {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('removeFromFavorites', { s: title })}
      testID={testID}
      className="rounded-[9px] border border-danger-border bg-danger-surface px-3 py-2 active:opacity-80"
    >
      <Text className="font-sans-semibold text-sm text-danger">
        {t('remove')}
      </Text>
    </Pressable>
  );
};
