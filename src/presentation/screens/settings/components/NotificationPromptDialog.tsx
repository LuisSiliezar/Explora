import React from 'react';
import { Dialog, DialogBadge } from '@presentation/components';
import { useT } from '@presentation/i18n';

interface Props {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
  onNotNow: () => void;
  /** Back button / tap outside: closes without a toast. */
  onClose: () => void;
}

/** In-app pre-prompt shown before the OS notification prompt. */
export const NotificationPromptDialog = ({
  visible,
  onAllow,
  onDeny,
  onNotNow,
  onClose,
}: Props) => {
  const t = useT();
  return (
    <Dialog
      visible={visible}
      icon={<DialogBadge icon="bell" />}
      title={t('notifPromptTitle')}
      body={t('notifPromptBody')}
      onRequestClose={onClose}
      actions={[
        { label: t('allow'), onPress: onAllow, variant: 'primary' },
        { label: t('dontAllow'), onPress: onDeny },
        { label: t('notNow'), onPress: onNotNow, variant: 'link' },
      ]}
    />
  );
};
