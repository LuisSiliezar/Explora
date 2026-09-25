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

/** Shown until the activity is available: a skeleton, an error with retry, or not found. */
export const DetailFallback = ({ loading, error, onBack, onRetry }: Props) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  if (loading) {
    return <DetailSkeleton onBack={onBack} />;
  }
  const code = isDomainError(error) ? error.code : undefined;
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
      {code === 'NOT_FOUND' ? (
        // A bad deep link: retrying can't help, so the only action is back.
        <ErrorState
          title={t('activityNotFoundTitle')}
          body={t('activityNotFoundBody')}
          retryLabel={t('back')}
          onRetry={onBack}
        />
      ) : (
        <ErrorState
          title={t(
            code === 'OFFLINE'
              ? 'offlineNoCatalogTitle'
              : 'activityUnavailable',
          )}
          body={t(
            code === 'OFFLINE' ? 'activityUnavailableOffline' : 'errorBody',
          )}
          retryLabel={t('retry')}
          onRetry={onRetry}
        />
      )}
    </View>
  );
};
