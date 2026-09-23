import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabBar } from '@presentation/components/navigation';
import { useSettings } from '@presentation/hooks/useSettings';
import { ActivitiesScreen } from '@presentation/screens/activities/ActivitiesScreen';
import { ActivityDetailScreen } from '@presentation/screens/activity-detail/ActivityDetailScreen';
import { AuthScreen } from '@presentation/screens/auth/AuthScreen';
import { FavoritesScreen } from '@presentation/screens/favorites/FavoritesScreen';
import { OnboardingScreen } from '@presentation/screens/onboarding/OnboardingScreen';
import { SettingsScreen } from '@presentation/screens/settings/SettingsScreen';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const renderTabBar = (props: React.ComponentProps<typeof TabBar>) => (
  <TabBar {...props} />
);

const Tabs = () => (
  <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Browse" component={ActivitiesScreen} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

/** First run: onboarding → optional sign in. After that: the app, with sign in as a modal. */
export const RootNavigator = () => {
  const onboardingDone = useSettings(state => state.onboardingDone);
  // "Auth" exists in both branches. A new key drops its route when the branch flips,
  // otherwise React Navigation would keep showing it after onboarding completes.
  const authKey = onboardingDone ? 'app' : 'onboarding';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {onboardingDone ? (
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen
            name="ActivityDetail"
            component={ActivityDetailScreen}
          />
          <Stack.Screen
            name="Auth"
            navigationKey={authKey}
            component={AuthScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen
            name="Auth"
            navigationKey={authKey}
            component={AuthScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
