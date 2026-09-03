import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { SectionHeader } from "@/components/SectionHeader";
import { BookIcon, ChevronRightIcon } from "@/components/icons";
import { iconForKey } from "@/components/iconForKey";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { colors, radius, spacing, type } from "@/theme";
import type { CoreBelief } from "@jainam/shared";
import { useLibrary } from "@/hooks/data";

function BeliefRow({ item, last }: { item: CoreBelief; last: boolean }) {
  const Icon = iconForKey[item.icon];
  return (
    <View style={[styles.beliefRow, last && styles.beliefRowLast]}>
      <View style={styles.beliefIcon}>
        <Icon size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.beliefTitle}>{item.title}</Text>
        <Text style={styles.beliefDescription}>{item.description}</Text>
      </View>
    </View>
  );
}

export default function LibraryScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const { data, isLoading, error, refetch } = useLibrary();

  return (
    <ScreenContainer>
      <ScreenHeader title="Wisdom Library" subtitle="Explore the eternal teachings" showBack={false} />

      <TextInput
        style={styles.search}
        placeholder="Search teachings, topics, scriptures..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {(data?.categories ?? []).map((category) => (
            <Chip
              key={category}
              label={category}
              active={category === activeCategory}
              onPress={() => setActiveCategory(category)}
            />
          ))}
        </ScrollView>

        <LinearGradient colors={[colors.brown, colors.ink]} style={styles.scriptureCard}>
          <BookIcon color={colors.goldLight} size={28} />
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.scriptureTitle}>{data?.featuredScripture.title}</Text>
            <Text style={styles.scriptureAuthor}>{data?.featuredScripture.author}</Text>
          </View>
        </LinearGradient>

        <SectionHeader title="Dharmic Essence" />
        <Card style={{ marginBottom: spacing.xl }}>
          {(data?.coreBeliefs ?? []).map((belief, index) => (
            <BeliefRow
              key={belief.id}
              item={belief}
              last={index === (data?.coreBeliefs.length ?? 0) - 1}
            />
          ))}
        </Card>

        <SectionHeader title="Core Practices" />
        <Card style={{ marginBottom: spacing.xl }}>
          {(data?.corePractices ?? []).map((practice, index) => (
            <BeliefRow
              key={practice.id}
              item={practice}
              last={index === (data?.corePractices.length ?? 0) - 1}
            />
          ))}
        </Card>

        {data?.continueReading ? (
          <>
            <SectionHeader title="Continue Reading" />
            <Card style={styles.continueCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.continueTitle}>{data.continueReading.title}</Text>
                <Text style={styles.continueMeta}>
                  {data.continueReading.chapter} {"\u00B7"} {data.continueReading.timeLeft}
                </Text>
              </View>
              <ChevronRightIcon />
            </Card>
          </>
        ) : null}
      </AsyncBoundary>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  search: {
    ...type.bodyMd,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  categories: {
    marginBottom: spacing.lg,
  },
  scriptureCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    minHeight: 140,
    justifyContent: "flex-end",
  },
  scriptureTitle: {
    ...type.displaySm,
    color: colors.cream,
  },
  scriptureAuthor: {
    ...type.bodySm,
    color: colors.goldLight,
    marginTop: 2,
  },
  beliefRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  beliefRowLast: {
    borderBottomWidth: 0,
  },
  beliefIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  beliefTitle: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  beliefDescription: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  continueTitle: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  continueMeta: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
