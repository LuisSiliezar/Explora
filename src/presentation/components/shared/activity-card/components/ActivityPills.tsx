import React from 'react';
import { View } from 'react-native';
import type { ActivityCategory } from '@domain/entities';
import { formatDistance } from '@presentation/utils';
import { Pill } from '../../Pill';

interface Props {
  category: ActivityCategory;
  distanceKm: number | null;
  className?: string;
}

/** Category pill, plus a distance pill when "Near me" is on. */
export const ActivityPills = ({
  category,
  distanceKm,
  className = '',
}: Props) => (
  <View className={`flex-row flex-wrap ${className}`}>
    <Pill label={category.toUpperCase()} />
    {distanceKm !== null && (
      <Pill label={formatDistance(distanceKm)} tone="neutral" />
    )}
  </View>
);
