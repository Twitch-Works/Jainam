import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { colors, radius, spacing, type } from "@/theme";
import { useKundli } from "@/hooks/data";

const CHART_SIZE = 300;

// House numbers positioned to mimic a traditional North-Indian Kundli diamond chart.
const housePositions = [
  { house: 5, x: CHART_SIZE * 0.32, y: CHART_SIZE * 0.18 },
  { house: 6, x: CHART_SIZE * 0.5, y: CHART_SIZE * 0.1 },
  { house: 7, x: CHART_SIZE * 0.68, y: CHART_SIZE * 0.18 },
  { house: 4, x: CHART_SIZE * 0.18, y: CHART_SIZE * 0.32 },
  { house: 8, x: CHART_SIZE * 0.82, y: CHART_SIZE * 0.32 },
  { house: 1, x: CHART_SIZE * 0.5, y: CHART_SIZE * 0.42 },
  { house: 3, x: CHART_SIZE * 0.18, y: CHART_SIZE * 0.68 },
  { house: 9, x: CHART_SIZE * 0.82, y: CHART_SIZE * 0.68 },
  { house: 2, x: CHART_SIZE * 0.32, y: CHART_SIZE * 0.82 },
  { house: 12, x: CHART_SIZE * 0.5, y: CHART_SIZE * 0.9 },
  { house: 10, x: CHART_SIZE * 0.68, y: CHART_SIZE * 0.82 },
  { house: 11, x: CHART_SIZE * 0.5, y: CHART_SIZE * 0.58 },
];

export default function KundliScreen() {
  const { data, isLoading, error, refetch } = useKundli();

  return (
    <ScreenContainer>
      <ScreenHeader title="Kundli (Jain Jyotish)" subtitle="Insights for self-awareness" />

      {/* The chart is static/illustrative; guidance + life themes come from the
          API but are seed data (REVIEW.md §3) until a Jain-jyotiṣ source exists. */}
      <View style={styles.chartWrap}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          <Line x1={0} y1={0} x2={CHART_SIZE} y2={0} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={0} y1={0} x2={0} y2={CHART_SIZE} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={CHART_SIZE} y1={0} x2={CHART_SIZE} y2={CHART_SIZE} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={0} y1={CHART_SIZE} x2={CHART_SIZE} y2={CHART_SIZE} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={0} y1={0} x2={CHART_SIZE} y2={CHART_SIZE} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={CHART_SIZE} y1={0} x2={0} y2={CHART_SIZE} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={CHART_SIZE / 2} y1={0} x2={0} y2={CHART_SIZE / 2} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={0} y1={CHART_SIZE / 2} x2={CHART_SIZE / 2} y2={CHART_SIZE} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={CHART_SIZE / 2} y1={CHART_SIZE} x2={CHART_SIZE} y2={CHART_SIZE / 2} stroke={colors.borderStrong} strokeWidth={1.5} />
          <Line x1={CHART_SIZE} y1={CHART_SIZE / 2} x2={CHART_SIZE / 2} y2={0} stroke={colors.borderStrong} strokeWidth={1.5} />
          {housePositions.map((p) => (
            <SvgText
              key={p.house}
              x={p.x}
              y={p.y}
              fill={colors.textSecondary}
              fontSize={13}
              textAnchor="middle"
            >
              {p.house}
            </SvgText>
          ))}
        </Svg>
      </View>
      <Text style={styles.chartNote}>
        Illustrative chart — not yet computed from your birth data.
      </Text>

      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        <SectionHeader title="Today's Guidance" />
        <Card style={styles.guidanceCard}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{data?.guidance.status}</Text>
          </View>
          <Text style={styles.guidanceNote}>{data?.guidance.note}</Text>
          <View style={styles.remedyWrap}>
            <Text style={styles.remedyLabel}>Remedy</Text>
            <Text style={styles.remedyText}>{data?.guidance.remedy}</Text>
          </View>
        </Card>

        <SectionHeader title="Life Themes" />
        <View style={styles.themeGrid}>
          {(data?.lifeThemes ?? []).map((theme) => (
            <View key={theme.id} style={styles.themeCard}>
              <Text style={styles.themeTitle}>{theme.title}</Text>
              <Text style={styles.themeValue}>{theme.value}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton label="View Detailed Analysis" style={{ marginTop: spacing.lg }} />
      </AsyncBoundary>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chartNote: {
    ...type.bodySm,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  guidanceCard: {
    marginBottom: spacing.xl,
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...type.labelSm,
    color: colors.success,
  },
  guidanceNote: {
    ...type.bodyMd,
    color: colors.textPrimary,
  },
  remedyWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  remedyLabel: {
    ...type.caption,
    color: colors.goldDeep,
    marginBottom: spacing.xxs,
  },
  remedyText: {
    ...type.bodyMd,
    color: colors.textSecondary,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  themeCard: {
    width: "47%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  themeTitle: {
    ...type.bodySm,
    color: colors.textSecondary,
  },
  themeValue: {
    ...type.labelMd,
    color: colors.textPrimary,
    marginTop: 2,
  },
});
