import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner-native';
import { createContainer, type Dependencies } from '@config/di';
import { env } from '@config/env';
import {
  queryClient as defaultQueryClient,
  setupQueryLifecycle,
} from '@config/query';
import { clearReminderUseCase } from '@core/use-cases';
import { createLinking } from '@presentation/routes/linking';
import { useTheme } from '@presentation/theme';
import { DependenciesProvider } from './DependenciesProvider';
import { toastIcons, toasterOptions } from './styles';
import { navigationTheme } from './utils';

interface Props {
  /** Injected in tests; production builds the real container once. */
  dependencies?: Dependencies;
  queryClient?: QueryClient;
}

export const AppProviders = ({
  children,
  dependencies,
  queryClient = defaultQueryClient,
}: PropsWithChildren<Props>) => {
  const [deps] = useState(() => dependencies ?? createContainer());
  const [linking] = useState(() =>
    createLinking({
      prefix: `${env.APP_URL_SCHEME}://`,
      notifications: deps.notifications,
      onReminderOpened: activityId => clearReminderUseCase(deps, activityId),
      isReady: () => deps.settingsStore.getState().onboardingDone,
    }),
  );
  const { scheme, colors } = useTheme();
  const dark = scheme === 'dark';

  useEffect(() => setupQueryLifecycle(), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <QueryClientProvider client={queryClient}>
          <DependenciesProvider value={deps}>
            <NavigationContainer
              linking={linking}
              theme={navigationTheme(dark, colors)}
            >
              {children}
            </NavigationContainer>
          </DependenciesProvider>
        </QueryClientProvider>
        {/* The design's toast: dark pill, green action, sitting above the tab bar. */}
        <Toaster
          position="bottom-center"
          offset={96}
          duration={2600}
          visibleToasts={1}
          icons={toastIcons}
          theme={dark ? 'dark' : 'light'}
          toastOptions={toasterOptions(colors)}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({ root: { flex: 1 } });
