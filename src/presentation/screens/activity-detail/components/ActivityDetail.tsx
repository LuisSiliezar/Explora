import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Activity } from '@domain/entities';
import { Banner, SectionLabel, Text } from '@presentation/components';
import {
  useFavorite,
  useIsOnline,
  useNearMe,
  useToggleFavorite,
} from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { enter } from '@presentation/theme';
import { usePhotoAction, useReminderAction } from '../hooks';
import { distanceTo } from '../utils';
import { DetailActions } from './DetailActions';
import { DetailHero } from './DetailHero';
import { DetailMeta } from './DetailMeta';
import { DetailTitleRow } from './DetailTitleRow';
import { OfflineStaleNote } from './OfflineStaleNote';
import { PhotoPickerDialog } from './PhotoPickerDialog';
import { SavedOfflineNote } from './SavedOfflineNote';

interface Props {
  activity: Activity;
  onBack: () => void;
}

/** The loaded detail view. */
export const ActivityDetail = ({ activity, onBack }: Props) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const online = useIsOnline();
  const favorite = useFavorite(activity.id);
  const toggleFavorite = useToggleFavorite();
  const { origin } = useNearMe();
  const { scheduling, onRemind } = useReminderAction(activity);
  const photo = usePhotoAction(activity);

  return (
    <View className="flex-1 bg-background">
      {!online && (
        <View style={{ paddingTop: insets.top }} className="bg-success">
          <Banner tone="notice" title={t('detailOffline')} strip />
        </View>
      )}
      <DetailHero activity={activity} online={online} onBack={onBack} />

      <ScrollView
        contentContainerClassName="gap-4 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <DetailTitleRow
          activity={activity}
          isFavorite={!!favorite}
          onToggleFavorite={() => toggleFavorite(activity)}
        />
        <DetailMeta
          location={activity.location}
          distance={distanceTo(origin, activity)}
        />
        <Animated.View entering={enter(2)} className="gap-2">
          <SectionLabel>{t('about')}</SectionLabel>
          <Text className="text-lg">{activity.description}</Text>
        </Animated.View>
        {favorite && <SavedOfflineNote />}
        {!online && <OfflineStaleNote />}
        <DetailActions
          title={activity.title}
          favorite={favorite}
          scheduling={scheduling}
          onRemind={onRemind}
          onAddPhoto={photo.openPicker}
        />
      </ScrollView>

      <PhotoPickerDialog
        visible={photo.pickerOpen}
        title={activity.title}
        hasPhoto={!!favorite?.photoUri}
        onPick={photo.onPickPhoto}
        onClose={photo.closePicker}
      />
    </View>
  );
};
