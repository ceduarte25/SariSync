export const colors = {
  bg: '#F4F1EA',
  card: '#FFFcf7',
  ink: '#1C1917',
  muted: '#78716C',
  line: '#E7E0D6',
  accent: '#C2410C',
  accentSoft: '#FFEDD5',
  debt: '#B91C1C',
  debtSoft: '#FEE2E2',
  paid: '#15803D',
  paidSoft: '#DCFCE7',
  white: '#FFFFFF',
} as const;

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const type = {
  title: { fontSize: 28, fontWeight: '800' as const, color: colors.ink },
  heading: { fontSize: 20, fontWeight: '700' as const, color: colors.ink },
  body: { fontSize: 16, fontWeight: '500' as const, color: colors.ink },
  muted: { fontSize: 14, fontWeight: '500' as const, color: colors.muted },
  money: { fontSize: 18, fontWeight: '800' as const, color: colors.ink },
};
