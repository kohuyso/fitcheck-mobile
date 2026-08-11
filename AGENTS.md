# Architectural Rules & Guidelines for FitCheck Mobile

This document defines the core rules, architectural guidelines, and engineering practices for the `fitcheck-mobile` React Native & Expo project. As a Senior React Native Engineer on this project, adhere strictly to these standards.

---

## 1. EXPO & REACT NATIVE (MOBILE CORE)

### SDK & Versioning
- **Expo SDK 57 (Compat SDK 54+)**: Target Expo SDK v57. Refer strictly to Expo docs at https://docs.expo.dev/versions/v57.0.0/.
- **Expo Router**: Use directory-based routing inside `src/app/`. Navigation MUST use `expo-router` (`useRouter`, `<Link>`, `<Stack>`, `<Tabs>`, `useLocalSearchParams`).
- **React 19 & React Native 0.81**: Adhere strictly to React 19 rules (hooks dependency management, async transitions, non-mutative state updates). Avoid deprecated React Native API patterns.

### UI & Styling (NativeWind v4)
- **NativeWind v4**: Use `className` attributes for styling React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`, `TextInput`).
- **Design Tokens**: Reference Tailwind design tokens (`tailwind.config.js` and `global.css`). Avoid hardcoded magic numbers or raw hex values.
- **Class Merging Utility**: Always merge conditional styles cleanly using `cn()` from `@/utils/cn` (which wraps `clsx` and `tailwind-merge`). Example: `cn("flex-1 p-4 bg-background", isSelected && "border-2 border-primary-500")`.
- **Layout Primitives**: Standardize on `View`, `Text`, `Pressable`, `ScrollView`, `FlatList` with Flexbox. Do NOT use web-only CSS properties (e.g. `grid`, `fixed`, display block/inline).
- **SafeArea & Insets**: Wrap screens in `<SafeAreaView className="flex-1 bg-background">` or use `useSafeAreaInsets()` from `react-native-safe-area-context` for dynamic header/bottom spacing.

### Device & Platform Handling
- **Dynamic IP & Local Dev API**: `src/api/axios.ts` dynamically resolves `debuggerHost` from Metro server to connect to `http://<HOST_IP>:8000` or `10.0.2.2:8000` (Android emulator). NEVER hardcode `localhost` or `127.0.0.1` for physical device/emulator API calls.
- **Platform Branching**: Use `Platform.OS` or `Platform.select()` when platform-specific UI or logic is needed (iOS vs. Android).

---

## 2. TYPESCRIPT & DATA INTEGRATION

### Strict Typing & Schemas
- **No `any`**: Strictly type all component Props, state variables, function signatures, and API payloads.
- **Generated OpenAPI Schemas**: Always import API request/response types directly from `@/api/types.gen` generated via `@hey-api/openapi-ts`. Run `npm run generate-api` when backend openapi spec updates.
- **API Client & Auth**: API operations are executed via `@/api/sdk.gen` or configured `api` instance in `@/api/axios.ts`. Bearer authentication token is handled automatically via `expo-secure-store` storage helpers (`@/api/storage`).

### State & Data Fetching (TanStack Query v5)
- **Server State**: Use `@tanstack/react-query` (`useQuery`, `useMutation`) for server state management. Always define structured query keys.
- **Optimistic Updates**: For instant UI feedback, implement optimistic updates in `useMutation` with proper cache rollback on error (`queryClient.setQueryData`, `onMutate`, `onError`, `onSettled`).
- **Forms**: Validate form inputs with `Zod` schemas integrated into `react-hook-form` via `@hookform/resolvers/zod`.

### Component Boundaries & Separation
- **Smart vs. Dumb Components**: 
  - *Smart Components / Screens* (`src/app/`, screen components): Handle data fetching, state, navigation, and hooks logic.
  - *Dumb / UI Components* (`src/components/`): Pure display components receiving strictly typed props.
- **Polymorphism & Props**: Extend standard React Native element props (`React.ComponentPropsWithoutRef<typeof View>`, etc.) for reusable atomic UI components.
- **Defensive Null-checking & Fallbacks**: Always handle loading, empty, and error states explicitly. Never crash due to `undefined` array/object access.

---

## 3. CAMERA, ASSETS & ANIMATIONS

- **Expo Image**: Use `Image` from `expo-image` (`import { Image } from 'expo-image'`) for all network and local images to leverage native caching, placeholders, and smooth transitions.
- **Image URL Helper**: Always wrap backend image paths with `getImageUrl()` from `@/utils/image-url`.
- **Camera & Picker**: Request permissions explicitly using `expo-camera` or `expo-image-picker`. Resize/compress photo assets before transmitting as `FormData` to backend endpoints.
- **Reanimated & Gestures**: Use `react-native-reanimated` (v4) and `react-native-gesture-handler` for interactive UI animations and bottom sheet drawers (`@gorhom/bottom-sheet`). Run animation logic strictly on the UI thread.

---

## 4. PERFORMANCE & MEMORY OPTIMIZATION

- **Virtualization**: Use `FlatList` (or `FlashList`) for lists exceeding 10 items. Define `keyExtractor` and memoize `renderItem` handlers.
- **Callback Memoization**: Wrap callbacks passed to child elements in `useCallback()` to prevent unnecessary component re-renders.
- **Resource Cleanup**: Ensure event listeners, timer intervals, and camera subscriptions clear on component unmount.

---

## 5. CODE OUTPUT FORMAT

- Return clear, clean, production-ready code snippets with proper imports and explicit TypeScript types.
- Ensure all file imports use `@/` alias mapped in `tsconfig.json`.
