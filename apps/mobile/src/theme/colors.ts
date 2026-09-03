// Design tokens — colours. PLAN.md §2.1 is the source of truth for these
// values; never hardcode a hex anywhere else in the app.
export const colors = {
  cream: "#F7F2E7",
  goldLight: "#EAD781",
  gold: "#D4AF7A",
  goldDeep: "#B8945A",
  brown: "#6F5535",
  ink: "#2C2C0A",

  white: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceMuted: "#FBF8F1",

  border: "rgba(111,85,53,0.14)",
  borderStrong: "rgba(111,85,53,0.28)",

  textPrimary: "#2C2C0A",
  textSecondary: "#6F5535",
  textMuted: "#9C8B6F",

  success: "#6E8B5C",
  warning: "#C08A3E",
} as const;

export type ColorToken = keyof typeof colors;
