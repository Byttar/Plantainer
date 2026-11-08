import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

export type AppTextProps = TextProps & {
  variant?: 'title' | 'heading' | 'body' | 'bodyBold' | 'caption' | 'label';
  color?: string;
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  return <Text style={[styles.base, styles[variant], color ? { color } : null, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 34,
    lineHeight: 40,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyBold: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textMuted,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
});
