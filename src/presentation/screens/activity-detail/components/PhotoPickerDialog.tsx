import React from 'react';
import type { PhotoSource } from '@domain/services';
import { Dialog } from '@presentation/components';
import { useT } from '@presentation/i18n';

interface Props {
  visible: boolean;
  title: string;
  hasPhoto: boolean;
  onPick: (source: PhotoSource) => void;
  onClose: () => void;
}

/** Camera or library choice for the favorite's photo. */
export const PhotoPickerDialog = ({
  visible,
  title,
  hasPhoto,
  onPick,
  onClose,
}: Props) => {
  const t = useT();
  return (
    <Dialog
      visible={visible}
      title={t(hasPhoto ? 'changePhoto' : 'addPhoto')}
      body={title}
      onRequestClose={onClose}
      actions={[
        {
          label: t('photoCamera'),
          onPress: () => onPick('camera'),
          variant: 'primary',
        },
        { label: t('photoLibrary'), onPress: () => onPick('library') },
        { label: t('cancel'), onPress: onClose, variant: 'link' },
      ]}
    />
  );
};
