---
name: "React Native & Expo Developer"
description: "Creating, editing, and debugging mobile UI components and application logic using React Native, Expo Router, and NativeWind (Tailwind CSS)."
---

# React Native & Expo Development Skill

This skill contains guidelines and instructions for writing, modifying, and refactoring React Native applications with Expo (v57) and NativeWind.

## 1. Expo Router & Routing Patterns
- Use directory-based routing (`app/` directory).
- Dynamic routes use `[id].tsx` syntax.
- Use `<Link>` or `useRouter()` hook from `expo-router` for navigation.
- Ensure all screens have appropriate layout structure (e.g. `<Stack.Screen options={{ title: '...' }} />`).

## 2. UI Components & NativeWind (Tailwind CSS for React Native)
- Use standard React Native primitive components (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `TextInput`, etc.).
- Apply styling using `className` with NativeWind classes.
- Since NativeWind maps CSS properties to React Native styles:
  * Avoid web-only styles (e.g., `grid`, `fixed`, complex selectors, gradient background defaults).
  * Use Flexbox layout for all alignments (`flex-row`, `items-center`, `justify-between`).
  * For border styling, ensure both border width and color are specified.
  * Use `active:opacity-70` or `active:scale-95` to style active interactive states.

## 3. Expo Image & Assets
- Use `Image` from `expo-image` for high-performance images (e.g., `import { Image } from 'expo-image';`).
- Use vectors and SF Symbols or `lucide-react-native` for clean rendering.
- Reference assets using `require('../../assets/images/filename.png')` or static remote URIs with error fallbacks.

## 4. Reanimated Animations
- Use `react-native-reanimated` for smooth UI transitions and layout animations.
- Use `useSharedValue`, `useAnimatedStyle`, and `withTiming` / `withSpring`.
- Ensure animations run entirely on the UI thread.
- Standard pattern:
  ```typescript
  import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
  
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  ```

## 5. Performance & Responsiveness
- Use standard React Hooks (`useMemo`, `useCallback`) to avoid redundant renders of lists and heavy components.
- Use FlatList / FlashList instead of ScrollView for long dynamic lists.
- Design responsive layouts using responsive Tailwind breakpoints (e.g., `md:`) or React Native's `useWindowDimensions`.
