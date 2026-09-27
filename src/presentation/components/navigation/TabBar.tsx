import React, { useContext } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { useT } from '@presentation/i18n/useT';
import type { TabParamList } from '@presentation/routes/types';
import { Icon } from '../shared/Icon';
import { Text } from '../shared/Text';
import {
  TAB_ICONS,
  TAB_ITEM_CLASS,
  TAB_LABEL_CLASS,
  TAB_LABEL_MAX_FONT_SCALE,
  TAB_LABELS,
} from './constants';

/**
 * The design's floating pill tab bar: icon + label, a grey pill behind the focused tab.
 * It floats over the screens, so it reports its height for `useTabBarHeight()`.
 */
export const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const t = useT();
  const { haptics } = useDependencies();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const onLayout = (event: LayoutChangeEvent) =>
    onHeightChange?.(event.nativeEvent.layout.height);

  return (
    <View
      onLayout={onLayout}
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 px-4"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View
        accessibilityRole="tablist"
        className="flex-row rounded-full border border-border bg-raised p-1.5 shadow-lg"
      >
        {state.routes.map((route, index) => {
          const name = route.name as keyof TabParamList;
          const focused = state.index === index;
          const status = focused ? 'focused' : 'idle';
          const label = t(TAB_LABELS[name]);
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              haptics.selection();
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              testID={`tab-${name.toLowerCase()}`}
              className={`flex-1 items-center gap-1 rounded-full py-2.5 ${TAB_ITEM_CLASS[status]}`}
            >
              <Icon name={TAB_ICONS[name]} size={24} color="text" />
              {/* Fixed-size chrome (ADR-007): at the largest text sizes a quarter of the bar can't fit
                  "Favorites", so the label shrinks on one line instead of breaking mid-word. The tab's
                  accessibilityLabel still reads the full name. */}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                maxFontSizeMultiplier={TAB_LABEL_MAX_FONT_SCALE}
                className={`text-sm text-text ${TAB_LABEL_CLASS[status]}`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
