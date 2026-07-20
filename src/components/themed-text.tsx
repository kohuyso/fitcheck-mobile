import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'display'
    | 'headline-lg'
    | 'headline-md'
    | 'title-lg'
    | 'body-lg'
    | 'body-md'
    | 'label-md'
    | 'label-sm'
    // Legacy support
    | 'default'
    | 'title'
    | 'subtitle'
    | 'small'
    | 'smallBold'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'display' && styles.display,
        type === 'headline-lg' && styles['headline-lg'],
        type === 'headline-md' && styles['headline-md'],
        type === 'title-lg' && styles['title-lg'],
        type === 'body-lg' && styles['body-lg'],
        type === 'body-md' && styles['body-md'],
        type === 'label-md' && styles['label-md'],
        type === 'label-sm' && styles['label-sm'],

        // Legacy mapping fallback
        type === 'default' && styles['body-lg'],
        type === 'title' && styles.display,
        type === 'subtitle' && styles['headline-lg'],
        type === 'small' && styles['label-md'],
        type === 'smallBold' && styles['label-sm'],

        type === 'link' && styles.link,
        type === 'linkPrimary' && [styles.linkPrimary, { color: theme.primary }],
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: Fonts.sans,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -0.68,
  },
  'headline-lg': {
    fontFamily: Fonts.sans,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.28,
  },
  'headline-md': {
    fontFamily: Fonts.sans,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  'title-lg': {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
  },
  'body-lg': {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  'body-md': {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  'label-md': {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0.13,
  },
  'label-sm': {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
    letterSpacing: 0.66,
  },
  link: {
    fontFamily: Fonts.sans,
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    fontFamily: Fonts.sans,
    lineHeight: 30,
    fontSize: 14,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
});
