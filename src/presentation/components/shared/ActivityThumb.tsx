import React, { memo, useState } from 'react';
import { Image, View } from 'react-native';
import type { Activity } from '@domain/entities';
import { activityImage, categoryTint } from '@presentation/theme';
import { DurationTile } from './DurationTile';
import { Text } from './Text';

interface Props {
  activity: Activity;
  /** thumb: 78×78 list thumbnail · grid: full-width 116pt card header. */
  variant: 'thumb' | 'grid';
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
      className={`overflow-hidden rounded-xl ${tint.bg} ${
        thumb ? 'h-[78px] w-[78px]' : 'h-[116px]'
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
          thumb ? 'bottom-1 left-1 px-1 py-px' : 'bottom-2 left-2 px-1.5 py-0.5'
        }`}
      >
        <Text
          className={`font-mono tracking-[0.6px] ${tint.fg} ${
            thumb ? 'text-[9px]' : 'text-[11px]'
          }`}
        >
          {activity.durationMinutes} MIN
        </Text>
      </View>
    </View>
  );
});
