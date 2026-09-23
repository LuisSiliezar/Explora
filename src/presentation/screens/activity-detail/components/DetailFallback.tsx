import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isDomainError } from '@domain/errors';
import { ErrorState, IconButton } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { DetailSkeleton } from './DetailSkeleton';

interface Props {
  loading: boolean;
  error: unknown;
  onBack: () => void;
  onRetry: () => void;
}

/** Shown until the activity is available: a skeleton, or an error with retry. */
export const DetailFallback = ({ loading, error, onBack, onRetry }: Props) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  if (loading) {
    return <DetailSkeleton onBack={onBack} />;
  }
  const offline = isDomainError(error) && error.code === 'OFFLINE';
  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top + 14 }}
    >
      <View className="px-5">
        <IconButton
          icon="back"
          onPress={onBack}
          accessibilityLabel={t('back')}
          testID="detail-back"
        />
      </View>
      <ErrorState
        title={t(offline ? 'offlineNoCatalogTitle' : 'activityUnavailable')}
        body={t(offline ? 'activityUnavailableOffline' : 'errorBody')}
        retryLabel={t('retry')}
        onRetry={onRetry}
      />
    </View>
  );
};
