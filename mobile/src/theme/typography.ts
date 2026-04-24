import { StyleSheet, TextStyle } from 'react-native';
import { Colors } from './colors';

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

type TypographyStyles = {
  display: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  bodyLarge: TextStyle;
  body: TextStyle;
  bodySmall: TextStyle;
  label: TextStyle;
  caption: TextStyle;
  price: TextStyle;
  priceLarge: TextStyle;
  button: TextStyle;
  buttonSmall: TextStyle;
};

export const Typography = StyleSheet.create<TypographyStyles>({
  display: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  h1: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  h2: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  h3: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  h4: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: FontSize.md,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: '400',
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  price: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  priceLarge: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  button: {
    fontSize: FontSize.base,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
