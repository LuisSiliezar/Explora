import React from 'react';
import { Dialog, DialogBadge } from '@presentation/components';
import { useT } from '@presentation/i18n';

interface Props {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
  onCancel: () => void;
}

/** In-app pre-prompt shown before the OS location prompt. */
export const LocationPromptDialog = ({
  visible,
  onAllow,
  onDeny,
  onCancel,
}: Props) => {
  const t = useT();
  return (
    <Dialog
      visible={visible}
      icon={<DialogBadge icon="location" />}
      title={t('locPromptTitle')}
      body={t('locPromptBody')}
      onRequestClose={onCancel}
      actions={[
        { label: t('allowWhileUsing'), onPress: onAllow, variant: 'primary' },
        { label: t('dontAllow'), onPress: onDeny },
        { label: t('notNow'), onPress: onCancel, variant: 'link' },
      ]}
    />
  );
};
