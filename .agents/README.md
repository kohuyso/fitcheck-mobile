# FitCheck Mobile - Senior React Native Context & Architecture Guide

Welcome to the **FitCheck Mobile** codebase context. This project is engineered as a modern, high-performance mobile application built with **React Native**, **Expo SDK 57**, **React 19**, and **NativeWind v4**.

---

## 1. TECH STACK MATRIX

| Category | Technology / Library | Description |
|---|---|---|
| **Core Framework** | Expo SDK 57 / React Native 0.81 | Expo managed workflow with native module support |
| **UI Library & CSS** | NativeWind v4 + Tailwind CSS | Utility-first styling with `cn()` merging |
| **Routing** | Expo Router v6 | File-based navigation inside `src/app/` |
| **Server State & Caching** | TanStack Query v5 (`@tanstack/react-query`) | Async state management & cache invalidation |
| **API Client & OpenAPI** | Axios + `@hey-api/openapi-ts` | Generated API SDK and type safety from backend spec |
| **Form Handling** | React Hook Form + Zod | Controlled form inputs with type-safe schema validation |
| **Animations & Drawers** | `react-native-reanimated` v4 + `@gorhom/bottom-sheet` | UI thread performance animations & bottom sheets |
| **Media & Hardware** | `expo-image`, `expo-camera`, `expo-image-picker` | Native image rendering, camera capture, and photo gallery |
| **Storage & Security** | `expo-secure-store`, `expo-sqlite` | Encrypted token storage & local database |

---

## 2. DIRECTORY STRUCTURE

```
fitcheck-mobile/
├── .agents/                      # AI Agent Customizations (Rules & Skills)
│   ├── AGENTS.md                 # Architectural Rules & Standards
│   └── skills/                   # Specialized Skill Blueprints
│       ├── react-native-expo-dev/
│       ├── nativewind-reanimated-ui/
│       ├── tanstack-query-openapi/
│       ├── mobile-form-validation/
│       └── mobile-camera-image-pipeline/
├── src/
│   ├── api/                      # OpenAPI SDK, Axios instance & Storage helpers
│   │   ├── axios.ts              # Dynamic Metro/Android emulator IP resolver & Axios client
│   │   ├── storage.ts            # SecureStore token storage
│   │   ├── sdk.gen.ts            # Generated OpenAPI endpoint functions
│   │   └── types.gen.ts          # Generated OpenAPI schema types
│   ├── app/                      # Expo Router File-Based Routing
│   │   ├── _layout.tsx           # Main App Root Layout & Query Client Provider
│   │   ├── index.tsx             # Home Screen
│   │   ├── closet.tsx            # Digital Closet View
│   │   ├── scan.tsx              # Camera / AI Outfit Scanner
│   │   ├── calendar.tsx          # Outfit Calendar & Schedule
│   │   ├── explore.tsx           # Style Discovery & Recommendations
│   │   ├── chat.tsx              # AI Stylist Chat
│   │   ├── item-detail.tsx       # Single Clothing Item Detail View
│   │   └── outfit-detail.tsx     # Single Outfit Detail View
│   ├── components/               # UI Primitives & Domain Components
│   ├── constants/                # App Constants & Theme Tokens
│   ├── hooks/                    # Custom React Hooks
│   └── utils/                    # Utility Functions (`cn`, `image-url`, formatters)
├── AGENTS.md                     # Root Architectural Rules
├── tailwind.config.js            # Tailwind Theme Configuration
├── openapi-ts.config.ts          # OpenAPI Generator Configuration
├── tsconfig.json                 # Path aliases (`@/*`)
└── package.json                  # Dependencies & NPM scripts
```

---

## 3. CORE DEVELOPER WORKFLOWS

### API Regeneration
When the backend API contract (`openapi.json`) updates:
```bash
npm run generate-api
```

### TypeScript Validation
Verify zero type errors across all screens and components:
```bash
npx tsc --noEmit
```

### Local Dev Backend Connection
The app dynamically inspects `debuggerHost` from Metro server in `src/api/axios.ts`:
- **Android Emulator**: `http://10.0.2.2:8000`
- **iOS Simulator / Real Device**: `http://<YOUR_COMPUTER_LAN_IP>:8000`

---

## 4. SENIOR ENGINEERING STANDARDS SUMMARY

1. **Strict Type Safety**: Never use `any`. Import all API schemas from `@/api/types.gen`.
2. **Atomic Styling**: Combine NativeWind utility classes using `@/utils/cn`.
3. **UI Thread Animations**: Run Reanimated worklets on the UI thread (`useAnimatedStyle`, `withSpring`).
4. **Optimistic UI Updates**: Provide instant feedback on mutations and gracefully roll back on network errors.
5. **Defensive Component Design**: Always render loading skeletons, empty states, and fallback images.
