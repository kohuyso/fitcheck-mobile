---
name: "NativeWind & Reanimated UI Aesthetics"
description: "Creating premium mobile UIs, animations, bottom sheet drawers, component modularization, and glassmorphism using NativeWind v4, react-native-reanimated, and @gorhom/bottom-sheet."
---

# NativeWind & Reanimated UI Aesthetics Skill

This skill details design principles, animation patterns, component modularization, and UI standards for crafting state-of-the-art mobile experiences in `fitcheck-mobile`.

## 1. Component Modularization & File Size Limits
- **Single Responsibility Principle (SRP)**: Avoid giant monolithic screen files (>250-300 lines). Break complex screens into modular sub-components inside domain folders (e.g. `src/components/closet/`, `src/components/scan/`, `src/components/outfit/`).
- **Isolation of Heavy Sub-views**: Move Modals, ActionSheets, Drawer sheets, and Complex Cards into separate component files. This prevents full-screen re-renders when local modal state changes.

## 2. Component Re-render Optimization
- **Memoization (`React.memo`)**: Wrap heavy pure display list items and cards in `React.memo` with custom comparison functions if needed.
- **Callback Memoization**: Pass memoized callbacks (`useCallback`) to child components.
- **Inline Object Avoidance**: Define static styles, animation config objects, or default props outside component render loops to prevent unnecessary object allocation on every frame.

## 3. Design Tokens & Visual Hierarchy
- Use design tokens from `tailwind.config.js` and `global.css`.
- Avoid default harsh primary colors. Use smooth gradients, slate/zinc neutrals, and rich accent colors.
- Card & Container standard: `rounded-2xl bg-white p-4 shadow-sm border border-slate-100`.
- Combine conditional classes cleanly using `cn()` from `@/utils/cn`.

## 4. Reanimated Animation Patterns (`react-native-reanimated`)
Run all animation styles strictly on the UI thread:

```tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedCard = React.memo(function AnimatedCard({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
    >
      {children}
    </AnimatedPressable>
  );
});
```

## 5. Bottom Sheet Drawers (`@gorhom/bottom-sheet`)
Extract Bottom Sheet Drawers into dedicated modular components:

```tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export const ActionSheetModal = React.memo(function ActionSheetModal({
  modalRef,
}: {
  modalRef: React.RefObject<BottomSheetModal>;
}) {
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#ffffff', borderRadius: 24 }}
    >
      <BottomSheetView className="p-6">
        <Text className="text-lg font-bold text-slate-900 mb-2">Options</Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
```
