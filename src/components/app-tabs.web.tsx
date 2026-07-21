import { usePathname } from 'expo-router';
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { Calendar, Camera, Home, User } from 'lucide-react-native';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';

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

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
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
  
  const activeColor = isDark ? '#0f766e' : '#0f766e';
  const inactiveColor = isDark ? '#64748b' : '#64748b';
  const color = isFocused ? activeColor : inactiveColor;

  if (name === 'scan') {
    const centerBgColor = isDark ? '#005c55' : '#005c55';
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

  const backgroundColor = isDark ? '#ffffff' : '#ffffff';
  const borderTopColor = isDark ? '#f1f5f9' : '#f1f5f9';

  if (pathname === '/scan') {
    return null;
  }

  return (
    <View {...props} style={[
      styles.tabListContainer,
      {
        backgroundColor,
        borderTopColor,
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
    height: 72,
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
