---
name: "React Native & Expo Developer"
description: "Creating, editing, and debugging mobile UI components, navigation flows, component modularization, and application logic using React Native, Expo Router, NativeWind v4, and Expo SDK 54."
---

# React Native & Expo Development Skill

This skill provides comprehensive guidelines for building, refactoring, and debugging mobile applications using **Expo SDK 54**, **Expo Router**, **React 19**, and **NativeWind v4**.

## 1. Directory & Routing Architecture (`src/app/`)
- All screens reside inside `src/app/` leveraging Expo Router's file-based navigation system.
- Layout hierarchy is managed using `_layout.tsx` files (`<Stack>`, `<Tabs>`).
- Dynamic screens follow the `[id].tsx` naming standard or query parameter model (`outfit-detail.tsx`, `item-detail.tsx`).
- Navigation actions:
  - Imperative: `const router = useRouter(); router.push({ pathname: '/outfit-detail', params: { id: '123' } });`
  - Back navigation: `router.back();`
  - Declarative: `<Link href={{ pathname: '/item-detail', params: { id: '123' } }}>`

## 2. Component & File Optimization Rules
- **Modular File Structure**: Split large screen components (>250 lines) into sub-components inside `src/components/<feature>/` (e.g. `src/components/closet/`, `src/components/scan/`, `src/components/outfit/`).
- **Strict Single Responsibility**: Separate screen data fetching / business logic (custom hooks or smart containers) from UI presentation (dumb components).
- **Prevent Unnecessary Re-renders**:
  - Wrap atomic list items and pure cards in `React.memo()`.
  - Pass memoized callbacks (`useCallback`) and memoized computed values (`useMemo`).
  - Do NOT instantiate inline arrow functions inside `renderItem` handlers in `FlatList`.

## 3. Navigation State Persistence & Parameter Handling
- **Safely Parsing Search Params**: Always check for single string vs array vs undefined from `useLocalSearchParams()`:
  ```tsx
  const params = useLocalSearchParams<{ id?: string; data?: string }>();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;
  ```
- **Preserving Detail Context on Back**: When navigating back from item detail to outfit detail, preserve outfit state. Use `NavigationHistoryContext` (`src/context/navigation-history.tsx`) or pass cached objects via router query state to prevent blank screen returns.

## 4. UI Primitives & NativeWind v4 Guidelines
- Use React Native primitives: `View`, `Text`, `Pressable`, `TouchableOpacity`, `ScrollView`, `TextInput`.
- Apply utility classes via `className`.
- Always merge dynamic or conditional classes using `cn()` from `@/utils/cn`:
  ```tsx
  import { cn } from '@/utils/cn';

  <View className={cn("flex-1 bg-white p-4", isActive && "bg-primary-50 border border-primary-500")} />
  ```
- **Flexbox Layouts**: Always use flex-based layouts (`flex-1`, `flex-row`, `items-center`, `justify-between`). Do NOT use web CSS grid, fixed positioning, or inline styles where NativeWind classes exist.
- **Pressable Feedback**: Use `active:opacity-70`, `active:scale-95` for press feedback.
- **SafeArea Handling**: Wrap screen roots in `<SafeAreaView className="flex-1 bg-background">` or use `useSafeAreaInsets()` from `react-native-safe-area-context` for dynamic inset padding.

## 5. Expo Image & Asset Optimization
- Import `Image` strictly from `expo-image` (`import { Image } from 'expo-image'`).
- Always process network image URLs using `getImageUrl()` from `@/utils/image-url`:
  ```tsx
  import { Image } from 'expo-image';
  import { getImageUrl } from '@/utils/image-url';

  <Image
    source={{ uri: getImageUrl(item.imageUrl) }}
    style={{ width: 80, height: 80, borderRadius: 12 }}
    contentFit="cover"
    transition={200}
  />
  ```

## 6. Performance & Virtualization Best Practices
- Prefer `FlatList` or `FlashList` over `ScrollView` for lists with >10 items. Provide explicit `keyExtractor` and `getItemLayout` where applicable.
- Clean up event listeners, intervals, and subscriptions on unmount.
