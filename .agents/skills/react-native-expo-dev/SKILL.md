---
name: "React Native & Expo Developer"
description: "Creating, editing, and debugging mobile UI components and application logic using React Native, Expo Router, NativeWind (Tailwind CSS), and Expo SDK 57."
---

# React Native & Expo Development Skill

This skill provides comprehensive guidelines for building, refactoring, and debugging mobile applications using **Expo SDK 57**, **Expo Router**, **React 19**, and **NativeWind v4**.

## 1. Directory & Routing Architecture (`src/app/`)
- All screens reside inside `src/app/` leveraging Expo Router's file-based navigation system.
- Use `_layout.tsx` files for layout hierarchy (`<Stack>`, `<Tabs>`).
- Dynamic screens must follow the `[id].tsx` naming standard and access parameters via `useLocalSearchParams()`.
- Navigation actions:
  - Imperative: `const router = useRouter(); router.push('/item-detail?id=123');`
  - Declarative: `<Link href={{ pathname: '/item-detail', params: { id: '123' } }}>`
- Always specify header screen options inside layout or screen components (`<Stack.Screen options={{ title: '...', headerBackTitle: 'Back' }} />`).

## 2. UI Components & NativeWind v4 Guidelines
- Use React Native primitives: `View`, `Text`, `Pressable`, `TouchableOpacity`, `ScrollView`, `TextInput`, `SafeAreaView`.
- Apply utility classes via `className`.
- Always merge dynamic or conditional classes using `cn()` from `@/utils/cn`:
  ```tsx
  import { cn } from '@/utils/cn';

  <View className={cn("flex-1 bg-white p-4", isActive && "bg-primary-50 border border-primary-500")} />
  ```
- **Flexbox Positioning**: Always use flex-based layouts (`flex-1`, `flex-row`, `items-center`, `justify-between`). Do NOT use web CSS grid, fixed positioning, or inline styles where NativeWind classes exist.
- **Active & Touch States**: Use `active:opacity-70`, `active:scale-95` for press feedback.
- **SafeArea Handling**: Wrap screen roots in `<SafeAreaView className="flex-1 bg-background">` or use `useSafeAreaInsets()` from `react-native-safe-area-context` for absolute positioned elements.

## 3. Expo Image & Media
- Import `Image` strictly from `expo-image` (`import { Image } from 'expo-image'`).
- Image rendering pattern with fallback & `getImageUrl()` helper:
  ```tsx
  import { Image } from 'expo-image';
  import { getImageUrl } from '@/utils/image-url';

  <Image
    source={{ uri: getImageUrl(item.imageUrl) }}
    style={{ width: 80, height: 80, borderRadius: 12 }}
    contentFit="cover"
    transition={200}
    placeholder={require('@/assets/images/placeholder.png')}
  />
  ```

## 4. Hardware APIs & Native Modules
- **Camera & Picker**: Use `expo-camera` for scanning/capture workflows and `expo-image-picker` for gallery selection.
- **Storage**: Use `expo-secure-store` for sensitive data (tokens) and `expo-sqlite` for local caching/offline data.
- **Location**: Use `expo-location` with explicit permission checks before fetching location coordinates.

## 5. Performance Best Practices
- Prefer `FlatList` or `FlashList` over `ScrollView` for lists with >10 items. Provide explicit `keyExtractor` and `getItemLayout` where applicable.
- Memoize heavy callbacks and computations using `useCallback` and `useMemo`.
- Avoid inline function allocations in list rendering loops (`renderItem`).
