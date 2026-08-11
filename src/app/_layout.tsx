import "../global.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import '@/api/axios';


import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import WelcomeScreen from '@/components/welcome-screen';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { NavigationHistoryProvider } from '@/context/navigation-history';

import { SafeAreaProvider } from 'react-native-safe-area-context';

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

function AppContent() {
  const colorScheme = useColorScheme();
  const { hasStarted, initialAuthMode, login } = useAuth();
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={FitCheckTheme}>
      <StatusBar style="dark" animated />
      <AnimatedSplashOverlay />
      {!hasStarted ? (
        <WelcomeScreen
          onGetStarted={login}
          initialAuthMode={initialAuthMode}
        />
      ) : (
        <AppTabs />
      )}
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#f6faf8' }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NavigationHistoryProvider>
              <AppContent />
            </NavigationHistoryProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
