import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Activity } from '@domain/entities';
import { IconButton, Text } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { activityImage, categoryTint } from '@presentation/theme';
import { HERO_HEIGHT } from '../constants';
import { detailStyles } from '../styles';

interface Props {
  activity: Activity;
  /** Offline, the banner above already covers the status bar. */
  online: boolean;
  onBack: () => void;
}

/** Tinted header photo with the back button and the big duration badge. */
export const DetailHero = ({ activity, online, onBack }: Props) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [photoFailed, setPhotoFailed] = useState(false);
  const tint = categoryTint[activity.category];
  const topInset = online ? insets.top : 0;
  return (
    <View
      className={`overflow-hidden ${tint.bg}`}
      style={{ height: HERO_HEIGHT + topInset }}
    >
      {!photoFailed && (
        <Image
          source={activityImage(activity)}
          resizeMode="cover"
          onError={() => setPhotoFailed(true)}
          accessible={false}
          style={detailStyles.photo}
        />
      )}
      <View
        className="flex-1 justify-between px-5 pb-5"
        style={{ paddingTop: topInset + 14 }}
      >
        <IconButton
          icon="back"
          onPress={onBack}
          accessibilityLabel={t('back')}
          testID="detail-back"
        />
        <View className={`self-start rounded-xl px-3 py-1.5 ${tint.bg}`}>
          <Text
            accessibilityLabel={`${activity.durationMinutes} min`}
            className={`font-display-bold text-5xl leading-tight tracking-tighter ${tint.fg}`}
          >
            {activity.durationMinutes}
            <Text
              className={`font-sans-medium text-sm tracking-widest ${tint.fg}`}
            >
              {' '}
              {t('min')}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};
