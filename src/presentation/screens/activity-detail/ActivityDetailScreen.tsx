import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Activity } from '@domain/entities';
import { isDomainError } from '@domain/errors';
import type { PhotoSource } from '@domain/services';
import { distanceKm } from '@core/use-cases';
import {
  Banner,
  Button,
  Dialog,
  ErrorState,
  FavoriteButton,
  Icon,
  IconButton,
  Pill,
  SectionLabel,
  Text,
} from '@presentation/components';
import {
  useActivity,
  useFavorite,
  useFavorites,
  useIsOnline,
  useNearMe,
  useToast,
  useToggleFavorite,
} from '@presentation/hooks';
import { useT } from '@presentation/i18n';
import type { RootStackScreenProps } from '@presentation/routes/types';
import {
  activityImage,
  categoryTint,
  enter,
  useTheme,
} from '@presentation/theme';
import { formatDistance } from '@presentation/utils';

const REMINDER_DELAY_MS = 60 * 60 * 1000;

export const ActivityDetailScreen = ({
  route,
  navigation,
}: RootStackScreenProps<'ActivityDetail'>) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const {
    data: activity,
    error,
    isPending,
    isError,
    refetch,
  } = useActivity(route.params.id);
  const offline = isDomainError(error) && error.code === 'OFFLINE';

  if (activity) {
    return <ActivityDetail activity={activity} onBack={navigation.goBack} />;
  }
  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top + 14 }}
    >
      <View className="px-5">
        <IconButton
          icon="back"
          onPress={navigation.goBack}
          accessibilityLabel={t('back')}
          testID="detail-back"
        />
      </View>
      {isPending && !isError ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ErrorState
          title={t(offline ? 'offlineNoCatalogTitle' : 'activityUnavailable')}
          body={t(offline ? 'activityUnavailableOffline' : 'errorBody')}
          retryLabel={t('retry')}
          onRetry={refetch}
        />
      )}
    </View>
  );
};

const ActivityDetail = ({
  activity,
  onBack,
}: {
  activity: Activity;
  onBack: () => void;
}) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const online = useIsOnline();
  const favorite = useFavorite(activity.id);
  const toggleFavorite = useToggleFavorite();
  const { attachPhoto, scheduleReminder } = useFavorites();
  const { origin } = useNearMe();
  const [scheduling, setScheduling] = useState(false);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [headerPhotoFailed, setHeaderPhotoFailed] = useState(false);
  const tint = categoryTint[activity.category];
  const distance =
    origin && activity.coordinates
      ? distanceKm(origin, activity.coordinates)
      : null;

  const showError = (error: unknown) =>
    toast.show(
      t(
        isDomainError(error) && error.code === 'PERMISSION_DENIED'
          ? 'toastPermissionNeeded'
          : 'toastSomethingWrong',
      ),
    );

  const onRemind = async () => {
    setScheduling(true);
    try {
      await scheduleReminder(
        activity,
        new Date(Date.now() + REMINDER_DELAY_MS),
      );
      toast.show(t('toastReminderSet'));
    } catch (error) {
      showError(error);
    } finally {
      setScheduling(false);
    }
  };

  const onPickPhoto = async (source: PhotoSource) => {
    setPhotoPickerOpen(false);
    try {
      if (await attachPhoto(activity, source)) {
        toast.show(t('toastPhotoSaved'));
      }
    } catch (error) {
      showError(error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {!online && (
        <View style={{ paddingTop: insets.top }} className="bg-success">
          <Banner tone="notice" title={t('detailOffline')} strip />
        </View>
      )}
      <View
        className={`overflow-hidden ${tint.bg}`}
        style={{ height: 228 + (online ? insets.top : 0) }}
      >
        {!headerPhotoFailed && (
          <Image
            source={activityImage(activity)}
            resizeMode="cover"
            onError={() => setHeaderPhotoFailed(true)}
            accessible={false}
            style={styles.photo}
          />
        )}
        <View
          className="flex-1 justify-between px-5 pb-5"
          style={{ paddingTop: (online ? insets.top : 0) + 14 }}
        >
          <IconButton
            icon="back"
            onPress={onBack}
            accessibilityLabel={t('back')}
            testID="detail-back"
          />
          <View className={`self-start rounded-xl px-3 py-1.5 ${tint.bg}`}>
            <Text
              accessibilityLabel={`${activity.durationMinutes} min`}
              className={`font-sans-bold text-[40px] leading-[44px] tracking-[-1.5px] ${tint.fg}`}
            >
              {activity.durationMinutes}
              <Text
                className={`font-mono text-[13px] tracking-[1.3px] ${tint.fg}`}
              >
                {' '}
                {t('min')}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="gap-4 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <Animated.View
          entering={enter(0)}
          className="flex-row items-start gap-3.5"
        >
          <View className="flex-1 gap-2">
            <Pill label={activity.category.toUpperCase()} />
            <Text
              accessibilityRole="header"
              className="font-sans-bold text-[27px] leading-[31px] tracking-[-0.5px]"
            >
              {activity.title}
            </Text>
          </View>
          <FavoriteButton
            variant="circle"
            isFavorite={!!favorite}
            onPress={() => toggleFavorite(activity)}
            testID="detail-favorite"
            accessibilityLabel={t(
              favorite ? 'removeFromFavorites' : 'addToFavorites',
              {
                s: activity.title,
              },
            )}
          />
        </Animated.View>

        <Animated.View
          entering={enter(1)}
          className="flex-row gap-[22px] border-y border-border py-3.5"
        >
          <View className="flex-1 gap-1">
            <SectionLabel>{t('locationLabel')}</SectionLabel>
            <Text className="font-sans-semibold text-[16px]">
              {activity.location}
            </Text>
          </View>
          {distance !== null && (
            <View className="gap-1">
              <SectionLabel>{t('nearMe').toUpperCase()}</SectionLabel>
              <Text className="font-sans-semibold text-[16px]">
                {t('away', { s: formatDistance(distance) })}
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={enter(2)} className="gap-2">
          <SectionLabel>{t('about')}</SectionLabel>
          <Text className="text-[16px] leading-[24px]">
            {activity.description}
          </Text>
        </Animated.View>

        {favorite && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            className="flex-row items-center gap-2.5 rounded-[10px] bg-success px-3.5 py-3"
          >
            <Icon name="heart" size={17} color="accent" filled />
            <Text className="flex-1 font-sans-semibold text-[14px]">
              {t('savedOffline')}
            </Text>
          </Animated.View>
        )}

        {!online && (
          <View className="gap-2.5">
            <Text className="text-[13px] leading-[19px] text-text-muted">
              {t('staleNote')}
            </Text>
            <Button
              label={t('refreshUnavailable')}
              variant="secondary"
              size="sm"
              disabled
              onPress={() => undefined}
            />
          </View>
        )}

        <Animated.View entering={enter(3)} className="mt-2 gap-2.5">
          <SectionLabel>{t('more')}</SectionLabel>
          {favorite?.photoUri && (
            <Image
              source={{ uri: favorite.photoUri }}
              className="aspect-[4/3] w-full rounded-xl"
              accessibilityLabel={t('yourPhoto', { s: activity.title })}
            />
          )}
          <Button
            label={t(favorite?.reminderId ? 'updateReminder' : 'remindMe')}
            variant="secondary"
            size="sm"
            loading={scheduling}
            onPress={onRemind}
          />
          <Button
            label={t(favorite?.photoUri ? 'changePhoto' : 'addPhoto')}
            variant="secondary"
            size="sm"
            onPress={() => setPhotoPickerOpen(true)}
          />
        </Animated.View>
      </ScrollView>

      <Dialog
        visible={photoPickerOpen}
        title={t(favorite?.photoUri ? 'changePhoto' : 'addPhoto')}
        body={activity.title}
        onRequestClose={() => setPhotoPickerOpen(false)}
        actions={[
          {
            label: t('photoCamera'),
            onPress: () => onPickPhoto('camera'),
            variant: 'primary',
          },
          { label: t('photoLibrary'), onPress: () => onPickPhoto('library') },
          {
            label: t('cancel'),
            onPress: () => setPhotoPickerOpen(false),
            variant: 'link',
          },
        ]}
      />
    </View>
  );
};

// Bundled images default to their file's size: pin both dimensions so the photo fills its
// (unpadded) container.
const styles = StyleSheet.create({
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
