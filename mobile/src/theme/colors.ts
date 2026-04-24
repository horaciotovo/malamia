export const Colors = {
  // ── Brand ──────────────────────────────
  primary: '#E8448A',
  primaryDark: '#C4306E',
  primaryLight: '#FF79B0',
  primarySoft: 'rgba(232, 68, 138, 0.15)',
  primaryBorder: 'rgba(232, 68, 138, 0.3)',

  // ── Backgrounds ───────────────────────
  background: '#0A0A0A',
  backgroundSecondary: '#111111',
  surface: '#1A1A1A',
  card: '#1E1E1E',
  cardElevated: '#252525',
  overlay: 'rgba(0, 0, 0, 0.75)',

  // ── Text ──────────────────────────────
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#666666',
  textMuted: '#444444',
  textInverse: '#000000',

  // ── Borders ───────────────────────────
  border: '#2A2A2A',
  borderLight: '#353535',
  divider: '#1E1E1E',

  // ── Status ────────────────────────────
  success: '#4CAF50',
  successSoft: 'rgba(76, 175, 80, 0.15)',
  error: '#FF4458',
  errorSoft: 'rgba(255, 68, 88, 0.15)',
  warning: '#FF9800',
  warningSoft: 'rgba(255, 152, 0, 0.15)',
  info: '#2196F3',
  infoSoft: 'rgba(33, 150, 243, 0.15)',

  // ── Base ──────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // ── Gradients (arrays for LinearGradient) ─
  gradientPrimary: ['#E8448A', '#C4306E'] as const,
  gradientHero: ['#E8448A', '#7B44E8'] as const,
  gradientDark: ['#222222', '#0A0A0A'] as const,
  gradientCard: ['#252525', '#1A1A1A'] as const,
  gradientSurface: ['#1E1E1E', '#141414'] as const,

  // ── Shimmer ───────────────────────────
  shimmerBase: '#1E1E1E',
  shimmerHighlight: '#2A2A2A',
} as const;

export type ColorKey = keyof typeof Colors;
