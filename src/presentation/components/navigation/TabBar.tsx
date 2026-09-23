import React from 'react';
import { Pressable, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDependencies } from '@presentation/providers/DependenciesProvider';
import { useFavorites } from '@presentation/hooks/useFavorites';
import { useT } from '@presentation/i18n/useT';
import type { StringKey } from '@presentation/i18n/strings';
import type { TabParamList } from '@presentation/routes/types';
import { Icon, type IconName } from '../shared/Icon';
import { Text } from '../shared/Text';

const LABELS: Record<keyof TabParamList, StringKey> = {
  Browse: 'browse',
  Favorites: 'favorites',
  Settings: 'settings',
};

/** The design's flat tab bar: icon + label, green when active. */
export const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const t = useT();
  const { haptics } = useDependencies();
  const { favorites } = useFavorites();

  const icons: Record<keyof TabParamList, IconName> = {
    Browse: 'browse',
    Favorites: 'heart',
    Settings: 'settings',
  };

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row border-t border-border bg-background pt-2.5"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      {state.routes.map((route, index) => {
        const name = route.name as keyof TabParamList;
        const focused = state.index === index;
        const label = t(LABELS[name]);
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
        const color = focused ? 'text-accent' : 'text-text-faint';
        const hasFavorites = name === 'Favorites' && favorites.length > 0;
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            testID={`tab-${name.toLowerCase()}`}
            className="flex-1 items-center gap-1"
          >
            <Icon
              name={icons[name]}
              size={22}
              color={focused ? 'accent' : 'textFaint'}
              filled={hasFavorites}
            />
            <Text className={`font-sans-semibold text-[11px] ${color}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
