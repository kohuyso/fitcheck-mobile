import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { BottomTabBarProps } from "expo-router/js-tabs";
import { Home, Camera, Calendar, User } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';

export function HangerIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 7V5c0-1.66 1.34-3 3-3a1 1 0 0 1 0 2c-0.55 0-1 0.45-1 1v2" />
      <Path d="M12 7L2 14c0 1 1 2 2.5 2h15c1.5 0 2.5-1 2.5-2L12 7z" />
    </Svg>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (
    pathname === '/scan' ||
    pathname === '/chat' ||
    pathname === '/outfit-detail' ||
    pathname.startsWith('/outfit') ||
    pathname === '/item-detail' ||
    pathname.startsWith('/item')
  ) {
    return null;
  }

  const tabRoutes = [
    { name: 'index', label: 'Home', icon: Home },
    { name: 'closet', label: 'Closet', icon: HangerIcon },
    { name: 'scan', label: 'Scan', icon: Camera },
    { name: 'calendar', label: 'Calendar', icon: Calendar },
    { name: 'explore', label: 'Profile', icon: User },
  ];

  return (
    <View
      style={[
        styles.tabListContainer,
        {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 72 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.innerContainer}>
        {tabRoutes.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isFocused = state.index === routeIndex;
          const activeColor = '#005c55';
          const inactiveColor = '#6e7977';
          const color = isFocused ? activeColor : inactiveColor;

          const onPress = () => {
            const route = state.routes[routeIndex];
            const event = navigation.emit({
              type: 'tabPress',
              target: route?.key || tab.name,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          if (tab.name === 'scan') {
            return (
              <Pressable key={tab.name} onPress={onPress} style={styles.centerButtonContainer}>
                <View style={[styles.centerButtonCircle, { backgroundColor: '#005c55' }]}>
                  <Camera size={26} color="#ffffff" />
                </View>
              </Pressable>
            );
          }

          const IconComponent = tab.icon;

          return (
            <Pressable key={tab.name} onPress={onPress} style={styles.tabButton}>
              <View style={styles.tabButtonContent}>
                <IconComponent size={22} color={color} />
                <Text style={[styles.tabButtonLabel, { color }]}>{tab.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  innerContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.two,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  centerButtonContainer: {
    width: 68,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 110,
  },
  centerButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -16 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
});
