import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { ChevronRightIcon } from "@/components/icons";
import { useBhajans } from "@/hooks/data";
import { colors, radius, spacing, type } from "@/theme";

export default function BhajansScreen() {
  const { data, isLoading, error, refetch } = useBhajans();

  return (
    <ScreenContainer>
      <ScreenHeader title="Bhajans" subtitle="Devotional songs to read and listen with." />
      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        <View style={styles.list}>
          {(data?.bhajans ?? []).map((b) => (
            <Pressable
              key={b.id}
              onPress={() => router.push(`/bhajans/${b.number}`)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              accessibilityRole="button"
              accessibilityLabel={b.title}
            >
              <View style={styles.numChip}>
                <Text style={styles.num}>{b.number}</Text>
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {b.title}
              </Text>
              <ChevronRightIcon size={18} />
            </Pressable>
          ))}
        </View>
      </AsyncBoundary>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rowPressed: {
    opacity: 0.6,
  },
  numChip: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  num: {
    ...type.labelMd,
    color: colors.goldDeep,
  },
  title: {
    ...type.bodyMd,
    color: colors.textPrimary,
    flex: 1,
  },
});
