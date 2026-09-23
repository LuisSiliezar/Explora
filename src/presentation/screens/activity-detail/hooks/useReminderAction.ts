import { useState } from 'react';
import type { Activity } from '@domain/entities';
import { useFavorites, useToast } from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import { REMINDER_DELAY_MS } from '../constants';
import { errorToastKey } from '../utils';

/** "Remind me": schedules a notification and reports the outcome in a toast. */
export const useReminderAction = (activity: Activity) => {
  const t = useT();
  const toast = useToast();
  const { scheduleReminder } = useFavorites();
  const [scheduling, setScheduling] = useState(false);

  const onRemind = async () => {
    setScheduling(true);
    try {
      await scheduleReminder(
        activity,
        new Date(Date.now() + REMINDER_DELAY_MS),
      );
      toast.success(t('toastReminderSet'));
    } catch (error) {
      toast.error(t(errorToastKey(error)));
    } finally {
      setScheduling(false);
    }
  };

  return { scheduling, onRemind };
};
