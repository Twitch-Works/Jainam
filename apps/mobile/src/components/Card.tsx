import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/theme";

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Set false when the card's own rows manage their padding (e.g. list cards). */
  padded?: boolean;
};

/**
 * Surface card: 1px hairline border over a white background, no heavy shadow
 * (PLAN.md §2.3 — thin borders, generous whitespace).
 */
export function Card({ children, style, padded = true }: CardProps) {
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.lg,
  },
});
