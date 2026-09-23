import React from 'react';
import { useActivity } from '@presentation/hooks';
import type { RootStackScreenProps } from '@presentation/routes/types';
import { ActivityDetail, DetailFallback } from './components';

export const ActivityDetailScreen = ({
  route,
  navigation,
}: RootStackScreenProps<'ActivityDetail'>) => {
  const {
    data: activity,
    error,
    isPending,
    isError,
    refetch,
  } = useActivity(route.params.id);

  if (activity) {
    return <ActivityDetail activity={activity} onBack={navigation.goBack} />;
  }
  return (
    <DetailFallback
      loading={isPending && !isError}
      error={error}
      onBack={navigation.goBack}
      onRetry={refetch}
    />
  );
};
