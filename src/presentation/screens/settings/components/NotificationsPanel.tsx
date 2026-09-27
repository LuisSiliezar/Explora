import React from 'react';
import { useNotificationSettings } from '../hooks';
import { NotificationPromptDialog } from './NotificationPromptDialog';
import { NotificationSettings } from './NotificationSettings';

/** Notifications sub-screen: the toggles and the in-app pre-prompt. */
export const NotificationsPanel = () => {
  const notifications = useNotificationSettings();
  return (
    <>
      <NotificationSettings
        notifications={notifications.notifications}
        on={notifications.on}
        onToggle={notifications.toggle}
        onToggleReminders={notifications.toggleReminders}
      />
      <NotificationPromptDialog
        visible={notifications.promptVisible}
        onAllow={notifications.allow}
        onDeny={notifications.deny}
        onNotNow={notifications.notNow}
        onClose={notifications.dismissPrompt}
      />
    </>
  );
};
