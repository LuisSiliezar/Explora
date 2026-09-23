import React, { memo, useState } from 'react';
import { Image, View } from 'react-native';
import type { Activity } from '@domain/entities';
import { activityImage, categoryTint } from '@presentation/theme';
import { DurationTile } from './DurationTile';
import { Text } from './Text';

interface Props {
  activity: Activity;
  /** thumb: 78×78 row thumbnail · card: the carousel card's full-width 260pt photo. */
  variant: 'thumb' | 'card';
}

/** Card artwork: the bundled photo with a duration badge. Falls back to DurationTile if it can't load. */
export const ActivityThumb = memo(({ activity, variant }: Props) => {
  const [failed, setFailed] = useState(false);
  const tint = categoryTint[activity.category];

  if (failed) {
    return (
      <DurationTile
        category={activity.category}
        minutes={activity.durationMinutes}
        variant={variant}
      />
    );
  }

  const thumb = variant === 'thumb';
  return (
    <View
      className={`overflow-hidden ${tint.bg} ${
        thumb ? 'h-[78px] w-[78px] rounded-xl' : 'h-[260px] rounded-2xl'
      }`}
    >
      <Image
        source={activityImage(activity)}
        resizeMode="cover"
        onError={() => setFailed(true)}
        accessible={false}
        className="h-full w-full"
      />
      <View
        className={`absolute rounded-[5px] ${tint.bg} ${
          thumb ? 'bottom-1 left-1 px-1 py-px' : 'bottom-2.5 left-2.5 px-2 py-1'
        }`}
      >
        <Text className={`font-sans-medium text-xs tracking-wider ${tint.fg}`}>
          {activity.durationMinutes} MIN
        </Text>
      </View>
    </View>
  );
});
