import "../global.css";

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';

import '@/api/axios';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import WelcomeScreen from '@/components/welcome-screen';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { NavigationHistoryProvider } from '@/context/navigation-history';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

const FitCheckTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f6faf8',
    card: '#ffffff',
    text: '#181c1c',
    border: '#e2e8f0',
  },
};

function AuthGate() {
  const { hasStarted, initialAuthMode, login } = useAuth();

  if (hasStarted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, backgroundColor: '#f6faf8' }]}>
      <WelcomeScreen
        onGetStarted={login}
        initialAuthMode={initialAuthMode}
      />
    </View>
  );
}

/**
 * Root Layout — chỉ chứa providers và <Slot>.
 * <Tabs> được đặt trong src/app/(tabs)/_layout.tsx theo Expo Router convention.
 * Expo Router tự quản lý NavigationContainer và routing.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#f6faf8' }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NavigationHistoryProvider>
              <ThemeProvider value={FitCheckTheme}>
                <StatusBar style="dark" animated />
                {fontsLoaded && <AnimatedSplashOverlay />}
                {/*
                 * <Slot> renders the matched child route.
                 * Expo Router will render (tabs)/_layout.tsx here when navigating to tab screens.
                 */}
                <Slot />
                <AuthGate />
              </ThemeProvider>
            </NavigationHistoryProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
