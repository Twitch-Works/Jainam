import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { LotusIcon } from "@/components/icons";
import { colors, radius, spacing, type } from "@/theme";
import { useCalendar } from "@/hooks/data";

export default function CalendarScreen() {
  const { data, isLoading, error, refetch } = useCalendar();

  return (
    <ScreenContainer>
      <ScreenHeader title="Jain Calendar" subtitle="Important dates to keep you on track" />
      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        {(data?.events ?? []).map((event) => (
          <View key={event.id} style={styles.row}>
            <View style={styles.iconWrap}>
              <LotusIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          </View>
        ))}

        {/* Data is a static seed list served by the API — see REVIEW.md §4.
            This opens the full month view once a Tithi-based feed exists. */}
        <PrimaryButton label="View Full Calendar" style={styles.viewAll} />
      </AsyncBoundary>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  viewAll: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  description: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
