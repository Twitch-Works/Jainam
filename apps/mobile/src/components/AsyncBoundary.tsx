import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, type } from "@/theme";

type AsyncBoundaryProps = {
  loading: boolean;
  error: unknown;
  onRetry?: () => void;
  children: ReactNode;
};

/** Consistent loading / error framing for a screen backed by a query. */
export function AsyncBoundary({ loading, error, onRetry, children }: AsyncBoundaryProps) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.goldDeep} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Couldn’t load this yet</Text>
        <Text style={styles.body}>
          {error instanceof Error ? error.message : "Something went wrong."}
        </Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retry} accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...type.displaySm,
    color: colors.textPrimary,
    textAlign: "center",
  },
  body: {
    ...type.bodySm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retry: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  retryText: {
    ...type.labelSm,
    color: colors.goldDeep,
  },
});
