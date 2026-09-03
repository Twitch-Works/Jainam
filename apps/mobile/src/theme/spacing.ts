// Design tokens — spacing & shape. PLAN.md §2.3.
// Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 48.
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Radius scale: sm 8, md 12, lg 16, xl 24, pill 999.
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;
