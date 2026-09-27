import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock, SkeletonGroup } from './Skeleton';

const ROWS = [0, 1, 2, 3];

/** Loading placeholder shaped like the result rows (search, favorites). */
export const ActivitySkeleton = () => (
  <SkeletonGroup className="gap-[18px] px-5 pt-1" testID="activity-skeleton">
    {ROWS.map(row => (
      <View key={row} className="flex-row items-center gap-3.5">
        <SkeletonBlock className="h-[78px] w-[78px] rounded-xl" />
        <View className="flex-1 gap-2">
          <SkeletonBlock className="h-4 w-[82%] rounded-[5px]" />
          <SkeletonBlock className="h-[13px] w-[54%] rounded-[5px]" />
          <SkeletonBlock className="h-3.5 w-16 rounded-[5px]" />
        </View>
      </View>
    ))}
  </SkeletonGroup>
);
