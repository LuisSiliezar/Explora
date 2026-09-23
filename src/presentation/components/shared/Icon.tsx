import React, { memo } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Compass,
  Heart,
  LayoutGrid,
  List,
  MapPin,
  Search,
  Settings,
  X,
} from 'lucide-react-native';
import { useTheme, type Colors } from '@presentation/theme';

/** The app's icon set. The only place lucide-react-native is imported: add new icons here. */
export const ICONS = {
  back: ChevronLeft,
  forward: ChevronRight,
  chevronDown: ChevronDown,
  heart: Heart,
  browse: Compass,
  settings: Settings,
  grid: LayoutGrid,
  list: List,
  close: X,
  check: Check,
  bell: Bell,
  location: MapPin,
  search: Search,
  alert: CircleAlert,
} as const;

export type IconName = keyof typeof ICONS;

interface Props {
  name: IconName;
  size?: number;
  /** Theme token, so dark mode follows the palette. */
  color?: keyof Colors;
  /** Raw color for the rare caller that already has one (e.g. category tints). */
  colorValue?: string;
  /** Fills the shape with the stroke color (e.g. a saved heart). */
  filled?: boolean;
  strokeWidth?: number;
}

/** Decorative vector icon: the parent pressable carries the accessibility label. */
export const Icon = memo(
  ({
    name,
    size = 20,
    color = 'text',
    colorValue,
    filled = false,
    strokeWidth = 2,
  }: Props) => {
    const { colors } = useTheme();
    const Glyph = ICONS[name];
    const tint = colorValue ?? colors[color];
    return (
      <Glyph
        testID={`icon-${name}`}
        size={size}
        color={tint}
        fill={filled ? tint : 'none'}
        strokeWidth={strokeWidth}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    );
  },
);
