import React from 'react';
import type { NotificationPreferences } from '@domain/entities';
import { Banner, Toggle } from '@presentation/components';
import { useT } from '@presentation/i18n';
import { notificationsTextKey } from '../utils';
import { SettingsRow } from './SettingsRow';

interface Props {
  notifications: NotificationPreferences;
  on: boolean;
  onToggle: () => void;
  onToggleReminders: (value: boolean) => void;
}

/** New-activities toggle, the reminders toggle once granted, or a blocked banner. */
export const NotificationSettings = ({
  notifications,
  on,
  onToggle,
  onToggleReminders,
}: Props) => {
  const t = useT();
  return (
    <>
      <SettingsRow
        title={t('notifNew')}
        subtitle={t(notificationsTextKey(notifications.status, on))}
        className="border-t border-border pt-3.5"
      >
        <Toggle
          value={on}
          onValueChange={onToggle}
          accessibilityLabel={t('notifNew')}
        />
      </SettingsRow>
      {notifications.status === 'granted' && (
        <SettingsRow
          title={t('notifReminder')}
          subtitle={t('notifReminderNote')}
          className="border-b border-border pb-3.5"
        >
          <Toggle
            value={notifications.reminders}
            onValueChange={onToggleReminders}
            accessibilityLabel={t('notifReminder')}
          />
        </SettingsRow>
      )}
      {notifications.status === 'denied' && (
        <Banner
          tone="danger"
          title={t('notifBlockedTitle')}
          body={t('notifBlockedBody')}
        />
      )}
    </>
  );
};
