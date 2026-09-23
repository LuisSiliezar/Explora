import React, { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TextScale } from '@domain/entities';
import { env } from '@config/env';
import {
  Banner,
  Button,
  Dialog,
  DialogBadge,
  Icon,
  SectionLabel,
  Text,
  Toggle,
} from '@presentation/components';
import {
  useAccount,
  useActivities,
  useDependencies,
  useFavorites,
  useNearMe,
  useResetLocalData,
  useSettings,
  useToast,
} from '@presentation/hooks';
import { LANGUAGES, useT } from '@presentation/i18n';
import type { TabScreenProps } from '@presentation/routes/types';
import { enter } from '@presentation/theme';
import { formatSyncTime } from '@presentation/utils';
import { LanguageSheet } from './LanguageSheet';

const TEXT_SIZES: { value: TextScale; size: number; label: string }[] = [
  { value: 0.92, size: 14, label: 'S' },
  { value: 1, size: 16, label: 'M' },
  { value: 1.12, size: 19, label: 'L' },
];

/** A labelled block. `order` staggers its entrance after the ones above it. */
const Section = ({
  label,
  order,
  children,
}: {
  label: string;
  order: number;
  children: ReactNode;
}) => (
  <Animated.View entering={enter(order)} className="gap-3">
    <SectionLabel>{label}</SectionLabel>
    {children}
  </Animated.View>
);

const Row = ({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) => (
  <View
    className={`flex-row items-center justify-between gap-3.5 ${className}`}
  >
    <View className="flex-1 gap-[3px]">
      <Text className="font-sans-semibold text-[16px]">{title}</Text>
      <Text className="text-[13px] leading-[18px] text-text-muted">
        {subtitle}
      </Text>
    </View>
    {children}
  </View>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between">
    <Text className="text-[15px] text-text-muted">{label}</Text>
    <Text className="font-sans-semibold text-[15px]">{value}</Text>
  </View>
);

export const SettingsScreen = ({ navigation }: TabScreenProps<'Settings'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const {
    settingsStore,
    notifications: notificationPort,
    haptics,
  } = useDependencies();
  const language = useSettings(state => state.language);
  const textScale = useSettings(state => state.textScale);
  const notifications = useSettings(state => state.notifications);
  const { account, signOut } = useAccount();
  const { favorites } = useFavorites();
  const { data, dataUpdatedAt } = useActivities();
  const nearMe = useNearMe();
  const resetLocalData = useResetLocalData();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notifPrompt, setNotifPrompt] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { setNotifications, setTextScale } = settingsStore.getState();

  const notificationsOn =
    notifications.status === 'granted' && notifications.weekly;

  const onToggleNotifications = () => {
    haptics.selection();
    if (notificationsOn) {
      setNotifications({ weekly: false });
      toast.show(t('toastNotifOff'));
      return;
    }
    if (notifications.status === 'granted') {
      setNotifications({ weekly: true });
      toast.show(t('toastNotifOn'));
      return;
    }
    setNotifPrompt(true);
  };

  const allowNotifications = async () => {
    setNotifPrompt(false);
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

  const onReset = async () => {
    setConfirmReset(false);
    await resetLocalData();
    haptics.success();
    toast.show(t('toastReset'));
  };

  const permissionText = {
    granted: t('permGranted'),
    denied: t('permDenied'),
    prompt: t('permAsk'),
  }[nearMe.permission];

  const notificationsText = notificationsOn
    ? t('notifNote')
    : t(notifications.status === 'prompt' ? 'notifAsk' : 'notifOff');

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerClassName="gap-[26px] px-5 pb-6 pt-3">
        <Animated.View entering={enter(0)}>
          <Text
            accessibilityRole="header"
            className="font-sans-bold text-[26px] tracking-[-0.5px]"
          >
            {t('settings')}
          </Text>
        </Animated.View>

        <View className="flex-row items-center gap-[13px] rounded-[14px] border border-border p-3.5">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-success">
            <Text className="font-sans-bold text-[17px] text-accent">
              {account
                ? (account.name ?? account.email).charAt(0).toUpperCase()
                : '?'}
            </Text>
          </View>
          <View className="flex-1 gap-[3px]">
            <Text numberOfLines={1} className="font-sans-semibold text-[16px]">
              {account ? account.name ?? account.email : t('guestAccount')}
            </Text>
            <Text numberOfLines={1} className="text-[13px] text-text-muted">
              {account ? account.email : t('guestSub')}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              if (account) {
                signOut();
                toast.show(t('toastSignedOut'));
              } else {
                navigation.navigate('Auth', { from: 'settings' });
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t(account ? 'signOut' : 'signIn')}
            className="rounded-[10px] border border-border px-[13px] py-[9px] active:border-text"
          >
            <Text className="font-sans-semibold text-[13px]">
              {t(account ? 'signOut' : 'signIn')}
            </Text>
          </Pressable>
        </View>

        <Section label={t('language')} order={1}>
          <Pressable
            onPress={() => setLanguageOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`${t('languageNote')}: ${
              LANGUAGES.find(l => l.code === language)?.name
            }`}
            className="flex-row items-center justify-between rounded-xl border border-border p-3.5 active:border-text"
          >
            <View className="gap-[3px]">
              <Text className="font-sans-semibold text-[16px]">
                {LANGUAGES.find(l => l.code === language)?.name}
              </Text>
              <Text className="text-[13px] text-text-muted">
                {t('languageNote')}
              </Text>
            </View>
            <Icon name="forward" size={18} color="textMuted" />
          </Pressable>
        </Section>

        <Section label={t('notifications')} order={2}>
          <Row
            title={t('notifNew')}
            subtitle={notificationsText}
            className="border-t border-border pt-3.5"
          >
            <Toggle
              value={notificationsOn}
              onValueChange={onToggleNotifications}
              accessibilityLabel={t('notifNew')}
            />
          </Row>
          {notifications.status === 'granted' && (
            <Row
              title={t('notifReminder')}
              subtitle={t('notifReminderNote')}
              className="border-b border-border pb-3.5"
            >
              <Toggle
                value={notifications.reminders}
                onValueChange={value => {
                  haptics.selection();
                  setNotifications({ reminders: value });
                }}
                accessibilityLabel={t('notifReminder')}
              />
            </Row>
          )}
          {notifications.status === 'denied' && (
            <Banner
              tone="danger"
              title={t('notifBlockedTitle')}
              body={t('notifBlockedBody')}
            />
          )}
        </Section>

        <Section label={t('textSize')} order={3}>
          <View className="flex-row gap-2">
            {TEXT_SIZES.map(option => {
              const selected = textScale === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    haptics.selection();
                    setTextScale(option.value);
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={t('textSizeOption', { s: option.label })}
                  accessibilityState={{ checked: selected }}
                  className={`flex-1 items-center rounded-[10px] border border-border py-3 ${
                    selected ? 'bg-primary' : 'bg-background'
                  }`}
                >
                  <Text
                    style={{ fontSize: option.size }}
                    className={`font-sans-semibold ${
                      selected ? 'text-on-primary' : 'text-text'
                    }`}
                  >
                    A
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="text-[13px] leading-[19px] text-text-muted">
            {t('textSizeNote')}
          </Text>
        </Section>

        <Section label={t('permissions')} order={4}>
          <Row
            title={t('location')}
            subtitle={permissionText}
            className="border-y border-border py-3.5"
          >
            <Toggle
              value={nearMe.permission === 'granted'}
              onValueChange={nearMe.togglePermission}
              accessibilityLabel={t('location')}
            />
          </Row>
        </Section>

        <Section label={t('data')} order={5}>
          <Stat
            label={t('cachedActivities')}
            value={String(data?.length ?? 0)}
          />
          <Stat label={t('savedFavorites')} value={String(favorites.length)} />
          <Stat
            label={t('lastSync')}
            value={formatSyncTime(dataUpdatedAt, language, t('never'))}
          />
          <Button
            label={t('resetData')}
            variant="danger"
            size="sm"
            className="mt-1.5"
            onPress={() => setConfirmReset(true)}
          />
          <Text className="text-[13px] leading-[19px] text-text-muted">
            {t('resetNote')}
          </Text>
        </Section>

        <Text className="font-mono text-[11px] tracking-[0.6px] text-text-muted">
          {t('version', { s: `1.0.0 · ${env.APP_ENV.toUpperCase()}` })}
        </Text>
      </ScrollView>

      <LanguageSheet
        visible={languageOpen}
        onClose={() => setLanguageOpen(false)}
      />

      <Dialog
        visible={notifPrompt}
        icon={<DialogBadge icon="bell" />}
        title={t('notifPromptTitle')}
        body={t('notifPromptBody')}
        onRequestClose={() => setNotifPrompt(false)}
        actions={[
          {
            label: t('allow'),
            onPress: allowNotifications,
            variant: 'primary',
          },
          {
            label: t('dontAllow'),
            onPress: () => {
              setNotifPrompt(false);
              setNotifications({ status: 'denied', weekly: false });
            },
          },
          {
            label: t('notNow'),
            onPress: () => {
              setNotifPrompt(false);
              toast.show(t('toastLocCancelled'));
            },
            variant: 'link',
          },
        ]}
      />

      <Dialog
        visible={confirmReset}
        title={t('resetTitle')}
        body={t('resetDialog', { n: favorites.length })}
        onRequestClose={() => setConfirmReset(false)}
        actions={[
          {
            label: t('resetConfirm'),
            onPress: onReset,
            variant: 'destructive',
          },
          { label: t('resetKeep'), onPress: () => setConfirmReset(false) },
        ]}
      />
    </View>
  );
};
