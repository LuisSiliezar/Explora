import React from 'react';
import { Image } from 'react-native';
import Animated from 'react-native-reanimated';
import type { Favorite } from '@domain/entities';
import { Button, SectionLabel } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { enter } from '@presentation/theme';

interface Props {
  title: string;
  favorite: Favorite | undefined;
  scheduling: boolean;
  onRemind: () => void;
  onAddPhoto: () => void;
}

/** "More" section: the user's photo, reminder and photo buttons. */
export const DetailActions = ({
  title,
  favorite,
  scheduling,
  onRemind,
  onAddPhoto,
}: Props) => {
  const t = useT();
  return (
    <Animated.View entering={enter(3)} className="mt-2 gap-2.5">
      <SectionLabel>{t('more')}</SectionLabel>
      {favorite?.photoUri && (
        <Image
          source={{ uri: favorite.photoUri }}
          className="aspect-[4/3] w-full rounded-xl"
          accessibilityLabel={t('yourPhoto', { s: title })}
        />
      )}
      <Button
        label={t(favorite?.reminderId ? 'updateReminder' : 'remindMe')}
        variant="secondary"
        size="sm"
        loading={scheduling}
        onPress={onRemind}
      />
      <Button
        label={t(favorite?.photoUri ? 'changePhoto' : 'addPhoto')}
        variant="secondary"
        size="sm"
        onPress={onAddPhoto}
      />
    </Animated.View>
  );
};
