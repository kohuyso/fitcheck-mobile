/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Legacy maps to prevent breaking existing screens
    text: '#181c1c',
    background: '#f7faf8',
    backgroundElement: '#ebefed',
    backgroundSelected: '#e5e9e7',
    textSecondary: '#3e4947',

    // Premium custom colors
    surface: '#f7faf8',
    'surface-dim': '#d7dbd9',
    'surface-bright': '#f7faf8',
    'surface-container-lowest': '#ffffff',
    'surface-container-low': '#f1f4f3',
    'surface-container': '#ebefed',
    'surface-container-high': '#e5e9e7',
    'surface-container-highest': '#e0e3e1',
    'on-surface': '#181c1c',
    'on-surface-variant': '#3e4947',
    'inverse-surface': '#2d3130',
    'inverse-on-surface': '#eef1f0',
    outline: '#6e7977',
    'outline-variant': '#bdc9c6',
    'surface-tint': '#006a63',
    primary: '#005c55',
    'on-primary': '#ffffff',
    'primary-container': '#0f766e',
    'on-primary-container': '#a3faef',
    'inverse-primary': '#80d5cb',
    secondary: '#545f73',
    'on-secondary': '#ffffff',
    'secondary-container': '#d5e0f8',
    'on-secondary-container': '#586377',
    tertiary: '#425268',
    'on-tertiary': '#ffffff',
    'tertiary-container': '#5a6a81',
    'on-tertiary-container': '#deeaff',
    error: '#ba1a1a',
    'on-error': '#ffffff',
    'error-container': '#ffdad6',
    'on-error-container': '#93000a',
    'primary-fixed': '#9cf2e8',
    'primary-fixed-dim': '#80d5cb',
    'on-primary-fixed': '#00201d',
    'on-primary-fixed-variant': '#00504a',
    'secondary-fixed': '#d8e3fb',
    'secondary-fixed-dim': '#bcc7de',
    'on-secondary-fixed': '#111c2d',
    'on-secondary-fixed-variant': '#3c475a',
    'tertiary-fixed': '#d3e4fe',
    'tertiary-fixed-dim': '#b7c8e1',
    'on-tertiary-fixed': '#0b1c30',
    'on-tertiary-fixed-variant': '#38485d',
    'on-background': '#181c1c',
    'surface-variant': '#e0e3e1',
  },
  dark: {
    // Legacy maps to prevent breaking existing screens
    text: '#e1e5e4',
    background: '#181c1c',
    backgroundElement: '#1e2222',
    backgroundSelected: '#292d2c',
    textSecondary: '#bdc9c6',

    // Premium custom colors (inverted dark scheme)
    surface: '#181c1c',
    'surface-dim': '#101414',
    'surface-bright': '#3e4241',
    'surface-container-lowest': '#0b0f0f',
    'surface-container-low': '#1a1e1e',
    'surface-container': '#1e2222',
    'surface-container-high': '#292d2c',
    'surface-container-highest': '#333737',
    'on-surface': '#e1e5e4',
    'on-surface-variant': '#bdc9c6',
    'inverse-surface': '#e1e5e4',
    'inverse-on-surface': '#181c1c',
    outline: '#889391',
    'outline-variant': '#3f4947',
    'surface-tint': '#80d5cb',
    primary: '#80d5cb',
    'on-primary': '#00201d',
    'primary-container': '#00504a',
    'on-primary-container': '#9cf2e8',
    'inverse-primary': '#005c55',
    secondary: '#bcc7de',
    'on-secondary': '#111c2d',
    'secondary-container': '#3c475a',
    'on-secondary-container': '#d8e3fb',
    tertiary: '#b7c8e1',
    'on-tertiary': '#0b1c30',
    'tertiary-container': '#38485d',
    'on-tertiary-container': '#d3e4fe',
    error: '#ffb4ab',
    'on-error': '#690005',
    'error-container': '#93000a',
    'on-error-container': '#ffdad6',
    'primary-fixed': '#9cf2e8',
    'primary-fixed-dim': '#80d5cb',
    'on-primary-fixed': '#00201d',
    'on-primary-fixed-variant': '#00504a',
    'secondary-fixed': '#d8e3fb',
    'secondary-fixed-dim': '#bcc7de',
    'on-secondary-fixed': '#111c2d',
    'on-secondary-fixed-variant': '#3c475a',
    'tertiary-fixed': '#d3e4fe',
    'tertiary-fixed-dim': '#b7c8e1',
    'on-tertiary-fixed': '#0b1c30',
    'on-tertiary-fixed-variant': '#38485d',
    'on-background': '#e1e5e4',
    'surface-variant': '#3f4947',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'Inter',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  default: {
    sans: 'Inter',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  // Legacy spacing values
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,

  // New design system spacing
  unit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  marginMobile: 20,
  gutterMobile: 12,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
