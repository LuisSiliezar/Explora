import { useState } from 'react';
import {
  useDependencies,
  useResetLocalData,
  useToast,
} from '@presentation/hooks';
import { useT } from '@presentation/i18n';

/** Confirmation dialog state around wiping local data. */
export const useResetDataDialog = () => {
  const t = useT();
  const toast = useToast();
  const { haptics } = useDependencies();
  const resetLocalData = useResetLocalData();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const ask = () => setConfirmVisible(true);
  const keep = () => setConfirmVisible(false);

  const confirm = async () => {
    setConfirmVisible(false);
    await resetLocalData();
    haptics.success();
    toast.success(t('toastReset'));
  };

  return { confirmVisible, ask, keep, confirm };
};
