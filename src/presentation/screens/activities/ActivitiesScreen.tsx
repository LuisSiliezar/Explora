import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isDomainError } from '@domain/errors';
import {
  ActivityList,
  ActivitySkeleton,
  Banner,
  Button,
  Chip,
  Dialog,
  DialogBadge,
  EmptyState,
  ErrorState,
  Icon,
  OfflineBanner,
  Text,
} from '@presentation/components';
import {
  useActivities,
  useActivityFilter,
  useActivityRows,
  useDependencies,
  useIsOnline,
  useNearMe,
  useOpenActivity,
  useSettings,
  useToast,
  useToggleFavorite,
} from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import type { TabScreenProps } from '@presentation/routes/types';
import { useTheme } from '@presentation/theme';
import { formatSyncTime } from '@presentation/utils';
import { FilterSheet } from './FilterSheet';

export const ActivitiesScreen = ({ navigation }: TabScreenProps<'Browse'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const toast = useToast();
  const online = useIsOnline();
  const { settingsStore, haptics } = useDependencies();
  const language = useSettings(state => state.language);
  const layout = useSettings(state => state.layout);
  const { data, error, isPending, isError, refetch, dataUpdatedAt } =
    useActivities();
  const filter = useActivityFilter(data);
  const nearMe = useNearMe();
  const rows = useActivityRows(filter.results, nearMe.origin);
  const toggleFavorite = useToggleFavorite();
  const openActivity = useOpenActivity();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!online) {
      haptics.warning();
      toast.show(t('toastCantRefresh'));
      return;
    }
    setRefreshing(true);
    try {
      await refetch();
      toast.show(t('toastUpdated'));
    } finally {
      setRefreshing(false);
    }
  }, [online, haptics, toast, t, refetch]);

  const toggleLayout = () => {
    haptics.selection();
    settingsStore.getState().setLayout(layout === 'list' ? 'grid' : 'list');
  };

  const count = filter.results.length;
  const countLabel = `${count} ${t(
    count === 1 ? 'activityCount' : 'activitiesCount',
  )}`;

  const renderContent = () => {
    if (isPending) {
      return <ActivitySkeleton />;
    }
    if (isError && !data) {
      const offline = isDomainError(error) && error.code === 'OFFLINE';
      return (
        <ErrorState
          title={t(offline ? 'offlineNoCatalogTitle' : 'errorTitle')}
          body={t(offline ? 'offlineNoCatalogBody' : 'errorBody')}
          retryLabel={t('retry')}
          onRetry={refetch}
          secondaryLabel={t('goFavorites')}
          onSecondary={() => navigation.navigate('Favorites')}
          code={t('errorCode', {
            s: formatSyncTime(dataUpdatedAt, language, t('never')),
          })}
        />
      );
    }
    return (
      <ActivityList
        key={nearMe.origin ? 'by-distance' : 'by-title'} // new order starts at the top
        rows={rows}
        layout={layout}
        onPressItem={openActivity}
        onToggleFavorite={toggleFavorite}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <EmptyState
            title={t('emptyNoMatch')}
            body={t('emptyNoMatchBody')}
            actionLabel={t('clearFilters')}
            onAction={filter.reset}
          />
        }
      />
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <OfflineBanner message={t('offlineBrowse')} />

      <View className="gap-[13px] px-5 pb-3.5 pt-3">
        <View className="flex-row items-center justify-between">
          <Text
            accessibilityRole="header"
            className="font-sans-bold text-[26px] tracking-[-0.5px]"
          >
            Explora
          </Text>
          <View className="flex-row items-center gap-3">
            <Text className="font-mono text-[11px] text-text-muted">
              {countLabel}
            </Text>
            <Pressable
              onPress={toggleLayout}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${t('layout')}: ${t(
                layout === 'list' ? 'layoutGrid' : 'layoutList',
              )}`}
              className="h-8 w-8 items-center justify-center rounded-lg border border-border active:border-text"
            >
              <Icon name={layout === 'list' ? 'grid' : 'list'} size={16} />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityRole="search"
          accessibilityLabel={t('searchPlaceholder')}
          className="h-[46px] flex-row items-center gap-2.5 rounded-xl border border-border bg-field px-3.5 active:border-text"
        >
          <Icon name="search" size={16} color="textMuted" />
          <Text
            numberOfLines={1}
            className="flex-1 text-[15px] text-text-muted"
          >
            {filter.query.trim() ? filter.query : t('searchPlaceholder')}
          </Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          <Chip
            label={t('nearMe')}
            selected={nearMe.active}
            onPress={nearMe.onPressNearMe}
            dot={
              nearMe.active
                ? 'on'
                : nearMe.permission === 'denied'
                ? 'disabled'
                : 'off'
            }
          />
          {filter.allCategories.map(category => (
            <Chip
              key={category}
              label={category}
              selected={filter.categories.includes(category)}
              onPress={() => {
                haptics.selection();
                filter.toggleCategory(category);
              }}
            />
          ))}
        </ScrollView>

        {filter.hasFilters && (
          <Animated.View
            entering={FadeIn.duration(150)}
            className="flex-row items-center justify-between"
          >
            <Text className="font-mono text-[11px] tracking-[0.4px] text-text-muted">
              {count} {t('results')} · {filter.activeCount} {t('filters')}
            </Text>
            <Pressable
              onPress={filter.reset}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('clearAll')}
            >
              <Text className="font-sans-semibold text-[13px] text-danger">
                {t('clearAll')}
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      <View className="flex-1">{renderContent()}</View>

      {nearMe.bannerVisible && (
        <Animated.View
          entering={FadeInDown.duration(220)}
          className="absolute bottom-4 left-5 right-5"
        >
          <Banner tone="danger" title={t('locOffTitle')} body={t('locOffBody')}>
            <View className="mt-3 flex-row gap-2">
              <Button
                label={t('openSettings')}
                variant="inverse"
                size="sm"
                onPress={() => Linking.openSettings()}
              />
              <Button
                label={t('dismiss')}
                variant="secondary"
                size="sm"
                onPress={nearMe.dismissBanner}
              />
            </View>
          </Banner>
        </Animated.View>
      )}

      {nearMe.locating && (
        <Animated.View
          entering={FadeIn.duration(150)}
          className="absolute inset-0 items-center justify-center gap-3.5 bg-background/90"
          accessibilityLiveRegion="polite"
        >
          <ActivityIndicator size="large" color={colors.accent} />
          <Text className="font-sans-semibold text-[15px]">
            {t('locating')}
          </Text>
        </Animated.View>
      )}

      <Dialog
        visible={nearMe.promptVisible}
        icon={<DialogBadge icon="location" />}
        title={t('locPromptTitle')}
        body={t('locPromptBody')}
        onRequestClose={nearMe.cancel}
        actions={[
          {
            label: t('allowWhileUsing'),
            onPress: nearMe.allow,
            variant: 'primary',
          },
          { label: t('dontAllow'), onPress: nearMe.deny },
          { label: t('notNow'), onPress: nearMe.cancel, variant: 'link' },
        ]}
      />

      <FilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        query={filter.query}
        onChangeQuery={filter.setQuery}
        allCategories={filter.allCategories}
        categories={filter.categories}
        onToggleCategory={category => {
          haptics.selection();
          filter.toggleCategory(category);
        }}
        duration={filter.duration}
        onToggleDuration={duration => {
          haptics.selection();
          filter.toggleDuration(duration);
        }}
        onClearAll={filter.reset}
        resultCount={count}
      />
    </View>
  );
};
