# Architectural Rules & Guidelines

This document defines the custom rules and guidelines for this React Native & Expo mobile project.

---

## 1. EXPO & REACT NATIVE (MOBILE)

### SDK & Versioning
- **Expo v57**: We are using Expo SDK v57.0.0. Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
- **Expo Router**: Use Expo Router (v57/Expo SDK 57 standard) for file-based navigation.
- **React 19 & React Native 0.86**: Adhere to React 19 rules (e.g., hooks, Suspense, ref handling).

### UI & Styling (NativeWind v4)
- **Styling**: Use NativeWind v4 (`className` attributes for React Native styling).
- **Design Tokens & Theme**: Always reference variables and colors from `tailwind.config.js` or `global.css`. Avoid hardcoded hex colors and absolute values where possible.
- **Conditional Classes**: Always merge classes cleanly using a utility function combined with `clsx` and `tailwind-merge` (e.g., `cn("base-class", conditional && "extra-class")`).
- **Animations**: Use `react-native-reanimated` for performance-critical animations.

### Best Practices & Hardware APIs
- **Platform Specific Code**: Use `Platform.select` or `.ios.tsx` / `.android.tsx` extensions when platform-specific logic is necessary.
- **Local Development URL**: Always use the machine's local IP or Android emulator helper IP (`10.0.2.2:8000`) for API requests rather than `localhost:8000` / `127.0.0.1:8000` on Android devices, as configured in `src/api/client.ts`.

---

## 2. TYPESCRIPT & DATA INTEGRATION

- **Strict Typing**: No usage of `any`. Explicitly type all component Props, API responses, and function signatures.
- **Component Polymorphism & Reusability**: Extend standard React Native element props using `React.ComponentPropsWithoutRef` or `React.ComponentPropsWithRef` for low-level UI elements (e.g., custom Buttons, Inputs) to preserve native React Native behaviors.
- **API Sync & Forms**: 
  * When integrating services generated from OpenAPI spec schemas (via `@hey-api/openapi-ts`), always reference types directly from the generated paths (e.g., `@/api/types.gen`).
  * Always validate input payloads using `Zod` (or equivalent schema validators) within forms and API integrations.
- **Component Separation & Boundaries**: 
  * Separate Smart Components (Data fetching/State logic handlers) from Dumb Components (Pure UI display that receives strictly typed props).
  * Build runtime robust code; ensure components executing async data handlers are accompanied by proper error handling or clean error-state props rendering to avoid application crashes.

---

## 3. CODE OUTPUT FORMAT

- Return ONLY the refactored or requested code snippet. Avoid writing long meta-explanations unless explicitly asked.
- Include proper TypeScript generics and defensive null-checking.
