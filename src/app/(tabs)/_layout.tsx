import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/custom-tab-bar';

/**
 * Tabs Layout — chỉ chứa <Tabs> navigator.
 * Đây là cách Expo Router chính thức yêu cầu:
 * - (tabs)/_layout.tsx export <Tabs> trực tiếp
 * - Expo Router wrap đây trong NavigationContainer nội bộ
 * - Providers được đặt ở root _layout.tsx, không ảnh hưởng tới navigation context
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="closet" options={{ title: 'Closet' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="explore" options={{ title: 'Profile' }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="outfit-detail" options={{ href: null }} />
      <Tabs.Screen name="item-detail" options={{ href: null }} />
    </Tabs>
  );
}
