import type { TextStyle } from "react-native";

// Design tokens — typography. PLAN.md §2.2.
// Display font: Playfair Display (headings, wordmark, screen titles).
// Body font: Inter (body copy, labels, buttons, UI chrome).
// The string values match the export names from the @expo-google-fonts
// packages and the keys registered in src/hooks/useAppFonts.ts.
export const fontFamily = {
  display: "PlayfairDisplay_600SemiBold",
  displayBold: "PlayfairDisplay_700Bold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
} as const;

type TypeToken = Pick<
  TextStyle,
  "fontFamily" | "fontSize" | "lineHeight" | "letterSpacing"
>;

// Type scale — PLAN.md §2.2. Keep the display/body split exactly as specified.
export const type = {
  displayXl: { fontFamily: fontFamily.displayBold, fontSize: 34, lineHeight: 40 },
  displayLg: { fontFamily: fontFamily.displayBold, fontSize: 28, lineHeight: 34 },
  displayMd: { fontFamily: fontFamily.display, fontSize: 22, lineHeight: 28 },
  displaySm: { fontFamily: fontFamily.display, fontSize: 18, lineHeight: 24 },

  bodyLg: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 23 },
  bodyMd: { fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 17 },

  labelMd: { fontFamily: fontFamily.bodyMedium, fontSize: 14, lineHeight: 18 },
  labelSm: { fontFamily: fontFamily.bodyMedium, fontSize: 12, lineHeight: 16 },

  caption: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
} as const satisfies Record<string, TypeToken>;
