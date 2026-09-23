import { useFavorites, useSettings } from '@presentation/hooks';
import { LANGUAGES, useT } from '@presentation/i18n';
import type { SettingsSectionKey } from '../constants';
import { TEXT_SIZES } from '../constants';
import { locationValueKey, notificationsValueKey } from '../utils';

/** The current value shown on each Settings row ("English", "On", "Medium"...). */
export const useSettingsSummary = (): Record<SettingsSectionKey, string> => {
  const t = useT();
  const language = useSettings(state => state.language);
  const textScale = useSettings(state => state.textScale);
  const notifications = useSettings(state => state.notifications);
  const locationPermission = useSettings(state => state.locationPermission);
  const { favorites } = useFavorites();

  const notificationsOn =
    notifications.status === 'granted' && notifications.weekly;
  const textSize = TEXT_SIZES.find(size => size.value === textScale);

  return {
    language: LANGUAGES.find(l => l.code === language)?.name ?? '',
    notifications: t(
      notificationsValueKey(notifications.status, notificationsOn),
    ),
    textSize: textSize ? t(textSize.name) : '',
    location: t(locationValueKey(locationPermission)),
    data: t('savedCount', { s: String(favorites.length) }),
  };
};
