import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { SectionHeader } from "@/components/SectionHeader";
import { ProfileIcon, ChevronRightIcon, BellIcon, CalendarIcon } from "@/components/icons";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { colors, radius, spacing, type } from "@/theme";
import { useMe } from "@/hooks/data";
import { useAuth } from "@/lib/auth";

const settingsRows = [
  { id: "reminders", label: "Reminders", value: "On" },
  { id: "language", label: "Voice & Language", value: "Hindi" },
  { id: "theme", label: "Theme", value: "Light" },
  { id: "privacy", label: "Privacy", value: "Manage" },
];

export default function ProfileScreen() {
  const { data, isLoading, error, refetch } = useMe();
  const { signOut } = useAuth();
  const profile = data?.profile;
  const progress = profile && profile.xpToNext ? profile.xp / profile.xpToNext : 0;

  return (
    <ScreenContainer>
      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <ProfileIcon size={32} color={colors.goldDeep} />
          </View>
          <Text style={styles.name}>{profile?.name || "Seeker"}</Text>
          <Text style={styles.role}>{profile?.role}</Text>
        </View>

        <Card style={{ marginBottom: spacing.xl }}>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Sadhak Level</Text>
            <Text style={styles.levelValue}>{profile?.sadhakLevel}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {(profile?.xp ?? 0).toLocaleString()} / {(profile?.xpToNext ?? 0).toLocaleString()}
          </Text>
        </Card>

        <SectionHeader title="My Vows" />
        <View style={styles.vowsRow}>
          {(profile?.vows ?? []).length === 0 ? (
            <Text style={styles.role}>No vows chosen yet.</Text>
          ) : (
            profile?.vows.map((vow) => <Chip key={vow} label={vow} active />)
          )}
        </View>

        <SectionHeader title="Explore" />
        <Card padded={false} style={{ marginBottom: spacing.xl }}>
          <SettingsRow
            icon={<CalendarIcon size={18} />}
            label="Jain Calendar"
            onPress={() => router.push("/calendar")}
          />
          <SettingsRow icon={<BellIcon size={18} />} label="Reminders" last onPress={() => {}} />
        </Card>

        <SectionHeader title="Settings" />
        <Card padded={false} style={{ marginBottom: spacing.xl }}>
          {settingsRows.map((row, index) => (
            <View
              key={row.id}
              style={[
                styles.settingsRow,
                index === settingsRows.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.settingsLabel}>{row.label}</Text>
              <View style={styles.settingsRight}>
                <Text style={styles.settingsValue}>{row.value}</Text>
                <ChevronRightIcon />
              </View>
            </View>
          ))}
        </Card>

        <Pressable onPress={() => signOut()} style={styles.signOut} accessibilityRole="button">
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </AsyncBoundary>
    </ScreenContainer>
  );
}

function SettingsRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.settingsRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.settingsLeft}>
        {icon}
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  signOut: {
    alignSelf: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  signOutText: {
    ...type.labelMd,
    color: colors.warning,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  name: {
    ...type.displayMd,
    color: colors.textPrimary,
  },
  role: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  levelLabel: {
    ...type.bodyMd,
    color: colors.textSecondary,
  },
  levelValue: {
    ...type.labelMd,
    color: colors.goldDeep,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.goldDeep,
    borderRadius: radius.pill,
  },
  progressText: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  vowsRow: {
    flexDirection: "row",
    marginBottom: spacing.xl,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  settingsLabel: {
    ...type.bodyMd,
    color: colors.textPrimary,
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  settingsValue: {
    ...type.bodySm,
    color: colors.textSecondary,
  },
});
