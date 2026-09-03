import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily, spacing } from "@/theme";
import { BrandMark } from "@/components/BrandMark";

/**
 * Full brand lockup — mark + "JAINAM" wordmark + optional tagline
 * (PLAN.md §2.5). Reserve this for splash / onboarding; elsewhere use the
 * bare [[BrandMark]].
 */
type LogoProps = {
  markSize?: number;
  showTagline?: boolean;
  showDescription?: boolean;
};

export function Logo({ markSize = 96, showTagline = true, showDescription = false }: LogoProps) {
  return (
    <View style={styles.wrap}>
      <BrandMark size={markSize} />
      <Text style={styles.wordmark}>JAINAM</Text>
      {showTagline ? (
        <Text style={styles.tagline}>Live with Ahimsa. Awaken the Soul.</Text>
      ) : null}
      {showDescription ? (
        <Text style={styles.description}>
          A holistic spiritual companion to practice, learn and live the eternal wisdom of Jainism.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  wordmark: {
    fontFamily: fontFamily.displayBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 6,
    color: colors.ink,
    marginTop: spacing.md,
  },
  tagline: {
    fontFamily: fontFamily.display,
    fontSize: 15,
    lineHeight: 22,
    color: colors.brown,
    marginTop: spacing.xs,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
