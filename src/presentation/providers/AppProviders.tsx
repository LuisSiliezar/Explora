import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner-native';
import { createContainer, type Dependencies } from '@config/di';
import {
  queryClient as defaultQueryClient,
  setupQueryLifecycle,
} from '@config/query';
import { useTheme, type Colors } from '@presentation/theme';
import { DependenciesProvider } from './DependenciesProvider';

interface Props {
  /** Injected in tests; production builds the real container once. */
  dependencies?: Dependencies;
  queryClient?: QueryClient;
}

/** The design's toast marker: a small green dot instead of sonner's variant icons. */
const toastDot = <View className="h-2 w-2 rounded-full bg-primary" />;
const toastIcons = {
  info: toastDot,
  success: toastDot,
  warning: toastDot,
  error: toastDot,
};

const navigationTheme = (dark: boolean, colors: Colors): NavigationTheme => {
  const base = dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };
};

export const AppProviders = ({
  children,
  dependencies,
  queryClient = defaultQueryClient,
}: PropsWithChildren<Props>) => {
  const [deps] = useState(() => dependencies ?? createContainer());
  const { scheme, colors, fonts } = useTheme();
  const dark = scheme === 'dark';

  useEffect(() => setupQueryLifecycle(), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <QueryClientProvider client={queryClient}>
          <DependenciesProvider value={deps}>
            <NavigationContainer theme={navigationTheme(dark, colors)}>
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
          toastOptions={{
            style: {
              backgroundColor: colors.inverse,
              borderRadius: 12,
              borderWidth: 0,
            },
            toastContentStyle: { alignItems: 'center' },
            // Title and Undo on one line, as in the design.
            textContainerStyle: {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            },
            titleStyle: {
              flex: 1,
              color: colors.onInverse,
              fontFamily: fonts.semibold,
              fontSize: 14,
            },
            buttonsStyle: { marginTop: 0, paddingTop: 0 },
            actionButtonStyle: {
              backgroundColor: 'transparent',
              borderWidth: 0,
              paddingHorizontal: 0,
              height: undefined,
            },
            actionButtonTextStyle: {
              color: colors.primary,
              fontFamily: fonts.bold,
              fontSize: 14,
            },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({ root: { flex: 1 } });
