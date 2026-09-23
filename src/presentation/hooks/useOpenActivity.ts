import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { Activity } from '@domain/entities';

export const useOpenActivity = () => {
  const navigation = useNavigation();
  return useCallback(
    (activity: Activity) =>
      navigation.navigate('ActivityDetail', {
        id: activity.id,
        title: activity.title,
      }),
    [navigation],
  );
};
