---
name: "NativeWind & Reanimated UI Aesthetics"
description: "Creating premium mobile UIs, animations, bottom sheet drawers, micro-interactions, and glassmorphism using NativeWind v4, react-native-reanimated, and @gorhom/bottom-sheet."
---

# NativeWind & Reanimated UI Aesthetics Skill

This skill details design principles, animation patterns, and UI component standards for crafting state-of-the-art mobile experiences in `fitcheck-mobile`.

## 1. Design Tokens & Visual Hierarchy
- Use design tokens from `tailwind.config.js` and `global.css`.
- Avoid default harsh primary colors. Use smooth gradients, slate/zinc neutrals, and rich accent colors.
- Card & Container standard: `rounded-2xl bg-white p-4 shadow-sm border border-slate-100`.
- Dark Mode / Modern Glassmorphism: Combine `expo-glass-effect` or semi-transparent backgrounds with backdrop blur where supported.

## 2. Reanimated Animation Patterns (`react-native-reanimated`)

### Smooth Scale & Fade Animation
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

export function AnimatedCard({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
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
}
```

## 3. Bottom Sheet Drawers (`@gorhom/bottom-sheet`)
Use `@gorhom/bottom-sheet` for popovers, filters, and action sheets:
```tsx
import React, { useRef, useMemo, useCallback } from 'react';
import { View, Text } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export function ActionSheetModal({ ref }: { ref: React.RefObject<BottomSheetModal> }) {
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#ffffff', borderRadius: 24 }}
    >
      <BottomSheetView className="p-6">
        <Text className="text-lg font-bold text-slate-900 mb-2">Options</Text>
        {/* Content */}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
```

## 4. UI Polish & Micro-Interactions
- **Icons**: Standardize on `lucide-react-native` for crisp vector icons. Pass explicit size and color props.
- **Skeleton Loading**: Render animated skeleton pulse components (`animate-pulse` or Reanimated interpolation) while data is loading.
- **Badges & Pill Tags**: Format metadata tags as `px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700`.
