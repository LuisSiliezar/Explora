import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CAROUSEL_CARD_GAP, CAROUSEL_CARD_WIDTH } from '../activity-card';
import { SkeletonBlock, SkeletonGroup } from './Skeleton';

const SECTIONS = [0, 1];
const CARDS = [0, 1];

/** Loading placeholder shaped like Browse's category sections of carousel cards. */
export const CarouselSkeleton = () => (
  <SkeletonGroup className="gap-7 pt-1">
    {SECTIONS.map(section => (
      <View key={section} className="gap-3.5">
        <View className="gap-2 px-5">
          <SkeletonBlock className="h-5 w-[45%] rounded-[5px]" />
          <SkeletonBlock className="h-[13px] w-24 rounded-[5px]" />
        </View>
        <View className="flex-row overflow-hidden pl-5">
          {CARDS.map(card => (
            <View key={card} className="gap-2" style={styles.card}>
              <SkeletonBlock className="h-[260px] rounded-2xl" />
              <SkeletonBlock className="h-4 w-[80%] rounded-[5px]" />
              <SkeletonBlock className="h-[13px] w-[50%] rounded-[5px]" />
            </View>
          ))}
        </View>
      </View>
    ))}
  </SkeletonGroup>
);

const styles = StyleSheet.create({
  card: { width: CAROUSEL_CARD_WIDTH, marginRight: CAROUSEL_CARD_GAP },
});
