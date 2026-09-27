import type { StringKey } from '@presentation/i18n/strings';
import type { TabParamList } from '@presentation/routes/types';
import type { IconName } from '../../shared/Icon';

type Tab = keyof TabParamList;

export const TAB_LABELS: Record<Tab, StringKey> = {
  Browse: 'browse',
  Search: 'search',
  Favorites: 'favorites',
  Settings: 'settings',
};

export const TAB_ICONS: Record<Tab, IconName> = {
  Browse: 'browse',
  Search: 'search',
  Favorites: 'heart',
  Settings: 'settings',
};

/** Literal classes (Tailwind only sees whole names): the focused tab sits on a grey pill. */
export const TAB_ITEM_CLASS = {
  focused: 'bg-tag-surface',
  idle: 'active:bg-canvas',
} as const;

export const TAB_LABEL_CLASS = {
  focused: 'font-sans-semibold',
  idle: 'font-sans-medium',
} as const;

/** Tab labels grow with the OS text size up to this, then shrink to fit on one line (ADR-007). */
export const TAB_LABEL_MAX_FONT_SCALE = 1.5;
