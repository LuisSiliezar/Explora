import React from 'react';
import { Dialog } from '@presentation/components';
import { useT } from '@presentation/i18n';

interface Props {
  visible: boolean;
  favoritesCount: number;
  onConfirm: () => void;
  onKeep: () => void;
}

/** Destructive confirmation before wiping favorites and cache. */
export const ResetDataDialog = ({
  visible,
  favoritesCount,
  onConfirm,
  onKeep,
}: Props) => {
  const t = useT();
  return (
    <Dialog
      visible={visible}
      title={t('resetTitle')}
      body={t('resetDialog', { n: favoritesCount })}
      onRequestClose={onKeep}
      actions={[
        {
          label: t('resetConfirm'),
          onPress: onConfirm,
          variant: 'destructive',
        },
        { label: t('resetKeep'), onPress: onKeep },
      ]}
    />
  );
};
