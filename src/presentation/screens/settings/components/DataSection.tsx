import React from 'react';
import { Button, Text } from '@presentation/components';
import { useSettings } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { formatSyncTime } from '@presentation/utils';
import { StatRow } from './StatRow';

interface Props {
  cachedCount: number;
  favoritesCount: number;
  lastSync: number;
  onReset: () => void;
}

/** Local data stats and the reset button. */
export const DataSection = ({
  cachedCount,
  favoritesCount,
  lastSync,
  onReset,
}: Props) => {
  const t = useT();
  const language = useSettings(state => state.language);
  return (
    <>
      <StatRow label={t('cachedActivities')} value={String(cachedCount)} />
      <StatRow label={t('savedFavorites')} value={String(favoritesCount)} />
      <StatRow
        label={t('lastSync')}
        value={formatSyncTime(lastSync, language, t('never'))}
      />
      <Button
        label={t('resetData')}
        variant="danger"
        size="sm"
        className="mt-1.5"
        onPress={onReset}
      />
      <Text className="text-sm text-text-muted">{t('resetNote')}</Text>
    </>
  );
};
