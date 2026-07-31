import { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
  defaultTabsSlotRender,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { Home, Camera, Calendar, User } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Screen } from 'react-native-screens';

import { ThemedText } from './themed-text';
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
      {/* Hook at top */}
      <Path d="M12 7V5c0-1.66 1.34-3 3-3a1 1 0 0 1 0 2c-0.55 0-1 0.45-1 1v2" />
      {/* Hanger triangle */}
      <Path d="M12 7L2 14c0 1 1 2 2.5 2h15c1.5 0 2.5-1 2.5-2L12 7z" />
    </Svg>
  );
}

interface AnimatedTabScreenProps {
  descriptor: Parameters<typeof defaultTabsSlotRender>[0];
  isFocused: boolean;
  loaded: boolean;
  detachInactiveScreens: boolean;
}

function AnimatedTabScreen({
  descriptor,
  isFocused,
  loaded,
  detachInactiveScreens,
}: AnimatedTabScreenProps) {
  const { lazy = true, unmountOnBlur, freezeOnBlur } = descriptor.options;
  
  const opacity = useSharedValue(isFocused ? 1 : 0);
  const scale = useSharedValue(isFocused ? 1 : 0.98);
  
  const [shouldMount, setShouldMount] = useState(isFocused || (loaded && !lazy && !unmountOnBlur));
  const [isVisible, setIsVisible] = useState(isFocused);

  useEffect(() => {
    if (isFocused) {
      setShouldMount(true);
      setIsVisible(true);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
          if (unmountOnBlur) {
            runOnJS(setShouldMount)(false);
          }
        }
      });
      scale.value = withTiming(0.98, { duration: 200 });
    }
  }, [isFocused, unmountOnBlur]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  if (!shouldMount) {
    return null;
  }

  const displayStyle = isVisible ? { display: 'flex' as const } : { display: 'none' as const };

  return (
    <Screen
      enabled={detachInactiveScreens}
      activityState={isFocused || isVisible ? 2 : 0}
      freezeOnBlur={freezeOnBlur}
      style={[
        styles.screen,
        displayStyle,
        { zIndex: isFocused ? 2 : 1 }
      ]}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {descriptor.render()}
      </Animated.View>
    </Screen>
  );
}

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot
        renderFn={(descriptor, options) => (
          <AnimatedTabScreen
            descriptor={descriptor}
            isFocused={options.isFocused}
            loaded={options.loaded}
            detachInactiveScreens={options.detachInactiveScreens}
          />
        )}
        style={{ height: '100%' }}
      />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton name="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="closet" href="/closet" asChild>
            <TabButton name="closet" label="Closet" />
          </TabTrigger>
          <TabTrigger name="scan" href="/scan" asChild>
            <TabButton name="scan" label="Scan" />
          </TabTrigger>
          <TabTrigger name="calendar" href="/calendar" asChild>
            <TabButton name="calendar" label="Calendar" />
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton name="explore" label="Profile" />
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <Pressable style={{ display: 'none' }} />
          </TabTrigger>
          <TabTrigger name="outfit-detail" href="/outfit-detail" asChild>
            <Pressable style={{ display: 'none' }} />
          </TabTrigger>
          <TabTrigger name="item-detail" href="/item-detail" asChild>
            <Pressable style={{ display: 'none' }} />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

interface TabButtonProps extends TabTriggerSlotProps {
  name: string;
  label: string;
}

export function TabButton({ name, label, isFocused, ...props }: TabButtonProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  
  const activeColor = isDark ? '#80d5cb' : '#0f766e';
  const inactiveColor = isDark ? '#9ca3af' : '#64748b';
  const color = isFocused ? activeColor : inactiveColor;

  if (name === 'scan') {
    const centerBgColor = isDark ? '#0f766e' : '#005c55';
    return (
      <Pressable {...props} style={styles.centerButtonContainer}>
        <View style={[styles.centerButtonCircle, { backgroundColor: centerBgColor }]}>
          <Camera size={26} color="#ffffff" />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable {...props} style={styles.tabButton}>
      <View style={styles.tabButtonContent}>
        {name === 'home' && <Home size={22} color={color} />}
        {name === 'closet' && <HangerIcon color={color} size={22} />}
        {name === 'calendar' && <Calendar size={22} color={color} />}
        {name === 'explore' && <User size={22} color={color} />}
        
        <ThemedText
          style={[
            styles.tabButtonLabel,
            { color: color }
          ]}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const pathname = usePathname();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const backgroundColor = isDark ? '#181c1c' : '#ffffff';
  const borderTopColor = isDark ? '#292d2c' : '#f1f5f9';

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

  return (
    <View {...props} style={[
      styles.tabListContainer,
      {
        backgroundColor,
        borderTopColor,
        height: 72 + insets.bottom,
        paddingBottom: insets.bottom,
      }
    ]}>
      <View style={styles.innerContainer}>
        {props.children}
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
  screen: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
