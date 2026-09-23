import { useState } from 'react';
import { useDependencies, useSettings, useToast } from '@presentation/hooks';
import { useT } from '@presentation/i18n';

/** Notification toggles plus the in-app pre-prompt shown before the OS one. */
export const useNotificationSettings = () => {
  const t = useT();
  const toast = useToast();
  const {
    settingsStore,
    notifications: notificationPort,
    haptics,
  } = useDependencies();
  const notifications = useSettings(state => state.notifications);
  const [promptVisible, setPromptVisible] = useState(false);
  const { setNotifications } = settingsStore.getState();

  const on = notifications.status === 'granted' && notifications.weekly;

  const toggle = () => {
    if (on) {
      setNotifications({ weekly: false });
      toast.show(t('toastNotifOff'));
      return;
    }
    if (notifications.status === 'granted') {
      setNotifications({ weekly: true });
      toast.show(t('toastNotifOn'));
      return;
    }
    setPromptVisible(true);
  };

  const toggleReminders = (value: boolean) => {
    setNotifications({ reminders: value });
  };

  const allow = async () => {
    setPromptVisible(false);
    const granted = await notificationPort
      .requestPermission()
      .catch(() => false);
    setNotifications({
      status: granted ? 'granted' : 'denied',
      weekly: granted,
    });
    if (granted) {
      haptics.success();
      toast.show(t('toastNotifOn'));
    } else {
      haptics.warning();
    }
  };

  const deny = () => {
    setPromptVisible(false);
    setNotifications({ status: 'denied', weekly: false });
  };

  const dismissPrompt = () => setPromptVisible(false);

  const notNow = () => {
    setPromptVisible(false);
    toast.show(t('toastLocCancelled'));
  };

  return {
    notifications,
    on,
    toggle,
    toggleReminders,
    promptVisible,
    allow,
    deny,
    notNow,
    dismissPrompt,
  };
};
