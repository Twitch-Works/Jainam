import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { colors, radius, spacing, type } from "@/theme";
import { useInsights } from "@/hooks/data";

export default function InsightsScreen() {
  const { data, isLoading, error, refetch } = useInsights();
  const stats = data?.stats;
  const consistency = data?.consistency ?? [];
  const maxBarHeight = 64;

  return (
    <ScreenContainer>
      <ScreenHeader title="Insights" subtitle="Your journey of inner transformation" showBack={false} />

      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        <View style={styles.statRow}>
          <StatCard label="Meditation" value={String(stats?.meditationMinutes ?? 0)} unit="min" />
          <StatCard
            label="Pratikraman"
            value={String(stats?.pratikramanSessions ?? 0)}
            unit={(stats?.pratikramanSessions ?? 0) === 1 ? "session" : "sessions"}
          />
          <StatCard label="Ahimsa Score" value={`${stats?.ahimsaScore ?? 0}%`} />
        </View>

        <SectionHeader title="Consistency" />
        <Card style={styles.chartCard}>
          <View style={styles.chartRow}>
            {consistency.map((d, i) => (
              <View key={`${d.day}-${i}`} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: Math.max(6, d.value * maxBarHeight) }]} />
                </View>
                <Text style={styles.barLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <InsightRow label="Longest Meditation" value={`${stats?.longestMeditation ?? 0} min`} />
          <InsightRow
            label="Total Steps of Pratikraman"
            value={String(stats?.totalPratikramanSteps ?? 0)}
          />
          <InsightRow
            label="Mantras Chanted"
            value={(stats?.mantrasChanted ?? 0).toLocaleString()}
            last
          />
        </Card>
      </AsyncBoundary>
    </ScreenContainer>
  );
}

function InsightRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.insightRow, !last && styles.insightRowBorder]}>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chartCard: {
    paddingTop: spacing.lg,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  barColumn: {
    alignItems: "center",
    gap: spacing.xs,
  },
  barTrack: {
    height: 64,
    width: 18,
    justifyContent: "flex-end",
  },
  barFill: {
    width: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.goldDeep,
  },
  barLabel: {
    ...type.caption,
    color: colors.textMuted,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  insightRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  insightLabel: {
    ...type.bodyMd,
    color: colors.textSecondary,
  },
  insightValue: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
});
