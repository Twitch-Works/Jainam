import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "@/theme";

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
};

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  value: {
    ...type.displaySm,
    color: colors.textPrimary,
  },
  unit: {
    ...type.bodySm,
    color: colors.textMuted,
  },
  label: {
    ...type.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
