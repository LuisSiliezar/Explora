import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  IconButton,
  SkeletonBlock,
  SkeletonGroup,
} from '@presentation/components';
import { useT } from '@presentation/i18n';
import { HERO_HEIGHT } from '../constants';

const ABOUT_LINES = ['w-full', 'w-full', 'w-[70%]'] as const;

interface Props {
  onBack: () => void;
}

/** Loading placeholder shaped like the detail view: hero, title, meta, about, actions. */
export const DetailSkeleton = ({ onBack }: Props) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background">
      <SkeletonGroup className="flex-1" testID="detail-skeleton">
        <SkeletonBlock style={{ height: HERO_HEIGHT + insets.top }} />
        <View className="gap-4 p-5">
          <View className="flex-row items-start gap-3.5">
            <View className="flex-1 gap-2">
              <SkeletonBlock className="h-6 w-20 rounded-full" />
              <SkeletonBlock className="h-7 w-[90%] rounded-md" />
              <SkeletonBlock className="h-7 w-[60%] rounded-md" />
            </View>
            <SkeletonBlock className="h-[54px] w-[54px] rounded-full" />
          </View>
          <View className="flex-row gap-[22px] border-y border-border py-3.5">
            <View className="flex-1 gap-2">
              <SkeletonBlock className="h-3 w-16 rounded-[5px]" />
              <SkeletonBlock className="h-4 w-[70%] rounded-[5px]" />
            </View>
            <View className="gap-2">
              <SkeletonBlock className="h-3 w-14 rounded-[5px]" />
              <SkeletonBlock className="h-4 w-16 rounded-[5px]" />
            </View>
          </View>
          <View className="gap-2">
            <SkeletonBlock className="h-3 w-16 rounded-[5px]" />
            {ABOUT_LINES.map((width, line) => (
              <SkeletonBlock
                key={line}
                className={`h-4 rounded-[5px] ${width}`}
              />
            ))}
          </View>
          <SkeletonBlock className="mt-2 h-[54px] rounded-[13px]" />
        </View>
      </SkeletonGroup>
      <View className="absolute left-5" style={{ top: insets.top + 14 }}>
        <IconButton
          icon="back"
          onPress={onBack}
          accessibilityLabel={t('back')}
          testID="detail-back"
        />
      </View>
    </View>
  );
};
