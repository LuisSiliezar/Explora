import type { TextScale } from '@domain/entities';
import type { StringKey } from '@presentation/i18n';

/** In-app text size options: store value, preview glyph class (literal, so Tailwind sees it), accessible label, row value. */
export const TEXT_SIZES: {
  value: TextScale;
  sizeClass: 'text-base' | 'text-lg' | 'text-xl';
  label: string;
  name: StringKey;
}[] = [
  { value: 0.92, sizeClass: 'text-base', label: 'S', name: 'sizeSmall' },
  { value: 1, sizeClass: 'text-lg', label: 'M', name: 'sizeMedium' },
  { value: 1.12, sizeClass: 'text-xl', label: 'L', name: 'sizeLarge' },
];

export const APP_VERSION = '1.0.0';

/** Each Settings row pushes one of these sub-screens. */
export type SettingsSectionKey =
  | 'language'
  | 'notifications'
  | 'textSize'
  | 'location'
  | 'data';

/** Row order on the Settings page, with each row's (and sub-screen's) title. */
export const SETTINGS_SECTIONS: {
  key: SettingsSectionKey;
  title: StringKey;
}[] = [
  { key: 'language', title: 'prefLanguage' },
  { key: 'notifications', title: 'prefNotifications' },
  { key: 'textSize', title: 'prefTextSize' },
  { key: 'location', title: 'prefLocation' },
  { key: 'data', title: 'prefData' },
];
