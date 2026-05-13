// Color System - Dark theme with pink accent
export const Colors = {
  // Brand
  primary: '#E8448A',
  primaryDark: '#C4306E',
  primaryLight: '#FF79B0',
  primarySoft: 'rgba(232, 68, 138, 0.15)',
  primaryBorder: 'rgba(232, 68, 138, 0.3)',

  // Backgrounds
  background: '#0A0A0A',
  backgroundSecondary: '#111111',
  surface: '#1A1A1A',
  card: '#1E1E1E',
  cardElevated: '#252525',
  overlay: 'rgba(0, 0, 0, 0.75)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#666666',
  textMuted: '#444444',
  textInverse: '#000000',

  // Borders
  border: '#2A2A2A',
  borderLight: '#353535',
  divider: '#1E1E1E',

  // Status
  success: '#4CAF50',
  successSoft: 'rgba(76, 175, 80, 0.15)',
  error: '#FF4458',
  errorSoft: 'rgba(255, 68, 88, 0.15)',
  warning: '#FF9800',
  warningSoft: 'rgba(255, 152, 0, 0.15)',
  info: '#2196F3',
  infoSoft: 'rgba(33, 150, 243, 0.15)',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Typography
export const FontSize = {
  xs: '11px',
  sm: '13px',
  base: '15px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  '4xl': '32px',
  '5xl': '40px',
} as const;

export const FontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// Spacing
export const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
  '4xl': '48px',
  '5xl': '64px',
  screen: '20px',
} as const;

export const BorderRadius = {
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '28px',
  full: '9999px',
} as const;

export const Shadow = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 5px 10px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 20px rgba(0, 0, 0, 0.5)',
  pink: '0 4px 14px rgba(232, 68, 138, 0.45)',
} as const;
