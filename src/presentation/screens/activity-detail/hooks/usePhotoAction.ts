import { useState } from 'react';
import type { Activity } from '@domain/entities';
import type { PhotoSource } from '@domain/services';
import { useDependencies, useFavorites, useToast } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { errorToastKey } from '../utils';

/** Photo picker dialog state and attaching the picked photo to the favorite. */
export const usePhotoAction = (activity: Activity) => {
  const t = useT();
  const toast = useToast();
  const { logger } = useDependencies();
  const { attachPhoto } = useFavorites();
  const [pickerOpen, setPickerOpen] = useState(false);

  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);

  const onPickPhoto = async (source: PhotoSource) => {
    setPickerOpen(false);
    try {
      if (await attachPhoto(activity, source)) {
        toast.success(t('toastPhotoSaved'));
      }
    } catch (error) {
      logger.warn('Attaching a photo failed', {
        activityId: activity.id,
        source,
        error,
      });
      toast.error(t(errorToastKey(error)));
    }
  };

  return { pickerOpen, openPicker, closePicker, onPickPhoto };
};
