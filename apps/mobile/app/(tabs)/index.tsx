import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { IconTile } from "@/components/IconTile";
import { SectionHeader } from "@/components/SectionHeader";
import { PracticeListItem } from "@/components/PracticeListItem";
import { BrandMark } from "@/components/BrandMark";
import {
  MeditateIcon,
  AhimsaHandIcon,
  ChantIcon,
  ChevronRightIcon,
  LotusIcon,
  BookIcon,
} from "@/components/icons";
import { colors, radius, spacing, type } from "@/theme";
import { useBhajans, useSadhana, useThoughtOfTheDay } from "@/hooks/data";

export default function HomeScreen() {
  const thought = useThoughtOfTheDay();
  const sadhana = useSadhana();
  const bhajans = useBhajans();
  const nextPractice = sadhana.data?.suggested ?? null;
  const bhajanCount = bhajans.data?.bhajans.length ?? 0;

  return (
    <ScreenContainer>
      <View style={styles.greetingRow}>
        <Text style={styles.greeting}>Pranam 🙏</Text>
        <BrandMark size={40} />
      </View>
      <Text style={styles.headline}>Return to{"\n"}your center</Text>
      <Text style={styles.subheadline}>A moment of stillness can transform your entire day.</Text>

      <LinearGradient
        colors={[colors.goldLight, colors.gold, colors.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroIconWrap}>
          <MeditateIcon size={64} color={colors.cream} strokeWidth={1.2} />
        </View>
      </LinearGradient>

      <Card style={styles.thoughtCard}>
        <Text style={styles.thoughtLabel}>THOUGHT OF THE DAY</Text>
        <Text style={styles.thoughtSanskrit}>{thought.data?.transliteration ?? "\u2026"}</Text>
        <Text style={styles.thoughtTranslation}>{thought.data?.translation ?? ""}</Text>
        {thought.data ? (
          <Text style={styles.thoughtSource}>
            {"\u2014"} {thought.data.source}
          </Text>
        ) : null}
      </Card>

      <View style={styles.quickActions}>
        <IconTile icon={<MeditateIcon />} label="Meditate" onPress={() => router.push("/meditate")} />
        <IconTile icon={<AhimsaHandIcon />} label="Pratikraman" onPress={() => router.push("/pratikraman")} />
        <IconTile icon={<BookIcon />} label="Ask Jainam" onPress={() => router.push("/ask-jainam")} />
        <IconTile icon={<ChantIcon />} label="Chant" onPress={() => router.push("/(tabs)/sadhana")} />
      </View>

      <SectionHeader
        title="Suggested Practice"
        actionLabel="View All"
        onAction={() => router.push("/(tabs)/sadhana")}
      />
      {nextPractice ? (
        <PracticeListItem
          icon={<LotusIcon />}
          title={nextPractice.title}
          description={nextPractice.description}
          duration={nextPractice.duration}
          onPress={() => router.push(`/sadhana/${nextPractice.id}`)}
        />
      ) : null}

      <SectionHeader
        title="Bhajans"
        actionLabel="View All"
        onAction={() => router.push("/bhajans")}
      />
      <Pressable onPress={() => router.push("/bhajans")} accessibilityRole="button">
        <Card style={styles.bhajanCard}>
          <View style={styles.bhajanIcon}>
            <ChantIcon />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bhajanTitle}>Devotional bhajans</Text>
            <Text style={styles.bhajanSub}>
              {bhajanCount > 0 ? `${bhajanCount} songs to ` : "Songs to "}read along and play.
            </Text>
          </View>
          <ChevronRightIcon />
        </Card>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    ...type.labelMd,
    color: colors.textSecondary,
  },
  headline: {
    ...type.displayXl,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subheadline: {
    ...type.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  hero: {
    height: 200,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroIconWrap: {
    opacity: 0.9,
  },
  thoughtCard: {
    marginBottom: spacing.xl,
  },
  thoughtLabel: {
    ...type.caption,
    color: colors.goldDeep,
    marginBottom: spacing.xs,
  },
  thoughtSanskrit: {
    ...type.displaySm,
    color: colors.textPrimary,
  },
  thoughtTranslation: {
    ...type.bodyMd,
    color: colors.textSecondary,
    marginTop: 4,
  },
  thoughtSource: {
    ...type.bodySm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  bhajanCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  bhajanIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  bhajanTitle: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  bhajanSub: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
