import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { AhimsaHandIcon } from "@/components/icons";
import { colors, radius, spacing, type } from "@/theme";
import type { PratikramanLength, PratikramanTypeId } from "@jainam/shared";
import {
  usePratikramanAvashyaka,
  usePratikramanGoal,
  usePratikramanProgress,
  usePratikramanSteps,
  usePratikramanTypes,
  usePreferences,
  useRecordPractice,
  useSavePratikramanGoal,
  useSavePratikramanProgress,
  useSavePreferences,
} from "@/hooks/data";

type Mode = "overview" | "session";

export default function PratikramanScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("overview");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");

  const prefsQ = usePreferences();
  const savePreferences = useSavePreferences();
  // Chosen type/length are synced preferences — they survive an app restart.
  const typeId: PratikramanTypeId = prefsQ.data?.preferences.pratikramanType ?? "devasi";
  const length: PratikramanLength = prefsQ.data?.preferences.pratikramanLength ?? "brief";

  const typesQ = usePratikramanTypes();
  const avashyakaQ = usePratikramanAvashyaka();
  const stepsQ = usePratikramanSteps(typeId, length);
  const progressQ = usePratikramanProgress();
  const goalQ = usePratikramanGoal();
  const saveProgress = useSavePratikramanProgress();
  const saveGoal = useSavePratikramanGoal();
  const recordPractice = useRecordPractice();

  const types = typesQ.data?.types ?? [];
  const avashyaka = avashyakaQ.data?.avashyaka ?? [];
  const steps = stepsQ.data?.steps ?? [];
  const total = steps.length;
  const activeType = types.find((t) => t.id === typeId);
  const activeTypeName = activeType?.name ?? "Devasi";

  const completed =
    progressQ.data?.progress.find((p) => p.typeSlug === typeId && p.length === length)
      ?.completedSteps ?? 0;
  const serverGoal = goalQ.data?.goal ?? "";

  function startEditingGoal() {
    setGoalDraft(serverGoal);
    setEditingGoal(true);
  }

  function switchType(next: PratikramanTypeId) {
    savePreferences.mutate({ pratikramanType: next });
    setStepIndex(0);
    setMode("overview");
  }
  function switchLength(next: PratikramanLength) {
    savePreferences.mutate({ pratikramanLength: next });
    setStepIndex(0);
    setMode("overview");
  }

  function persist(completedSteps: number) {
    saveProgress.mutate({ typeSlug: typeId, length, completedSteps });
  }

  function begin() {
    const restarting = completed >= total;
    if (restarting) persist(0);
    setStepIndex(restarting ? 0 : Math.min(completed, Math.max(total - 1, 0)));
    setMode("session");
  }

  function next() {
    if (stepIndex >= total - 1) {
      persist(total);
      recordPractice.mutate({ kind: "pratikraman", steps: total });
      setStepIndex(0);
      setMode("overview");
      return;
    }
    const n = stepIndex + 1;
    setStepIndex(n);
    persist(Math.max(completed, n));
  }

  function saveGoalNow() {
    saveGoal.mutate(goalDraft.trim() || serverGoal);
    setEditingGoal(false);
  }

  if (mode === "session") {
    const step = steps[stepIndex];
    const isLast = stepIndex >= total - 1;
    return (
      <ScreenContainer>
        <ScreenHeader
          title="Daily Pratikraman"
          subtitle={`${activeTypeName} · Step ${stepIndex + 1} of ${total}`}
        />

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${total ? ((stepIndex + 1) / total) * 100 : 0}%` }]}
          />
        </View>

        {step ? (
          <Card style={styles.stepCard}>
            <Text style={styles.stepPhase}>{step.phase}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepInstruction}>{step.instruction}</Text>
            {step.recitation ? (
              <View style={styles.recitationBox}>
                <Text style={styles.recitationLabel}>Recite</Text>
                <Text style={styles.recitationText}>{step.recitation}</Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        <View style={styles.sessionNav}>
          <Pressable
            onPress={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            style={[styles.backBtn, stepIndex === 0 && styles.btnDisabled]}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <PrimaryButton label={isLast ? "Complete" : "Next"} onPress={next} />
          </View>
        </View>

        <Pressable onPress={() => setMode("overview")} style={styles.pauseBtn}>
          <Text style={styles.pauseText}>Pause &amp; save progress</Text>
        </Pressable>

        <Text style={styles.reviewNote}>
          Guided outline for review — sūtra sequence and text should be confirmed against an
          authoritative Śvetāmbar Mūrtipūjak pothī before relying on it.
        </Text>
      </ScreenContainer>
    );
  }

  const ctaLabel =
    completed === 0
      ? "Begin Pratikraman"
      : completed >= total
        ? "Start Again"
        : `Continue — step ${completed + 1}`;

  return (
    <ScreenContainer>
      <ScreenHeader title="Daily Pratikraman" subtitle="Cleanse. Reflect. Realign." />

      <View style={styles.ringWrap}>
        <ProgressRing
          progress={total ? completed / total : 0}
          size={220}
          centerIcon={<AhimsaHandIcon size={40} />}
          label={`${completed} / ${total || "…"}`}
          sublabel={`${activeTypeName} Pratikraman`}
        />
      </View>

      <PrimaryButton
        label={ctaLabel}
        style={{ marginBottom: spacing.xl }}
        disabled={total === 0}
        onPress={begin}
      />

      <AsyncBoundary
        loading={typesQ.isLoading || avashyakaQ.isLoading}
        error={typesQ.error ?? avashyakaQ.error}
        onRetry={() => {
          typesQ.refetch();
          avashyakaQ.refetch();
        }}
      >
        <SectionHeader title="Choose your Pratikramaṇa" />
        <View style={styles.typeList}>
          {types.map((t) => {
            const active = t.id === typeId;
            return (
              <Pressable
                key={t.id}
                onPress={() => switchType(t.id)}
                style={[styles.typeCard, active && styles.typeCardActive]}
              >
                <View style={styles.typeCardHead}>
                  <Text style={[styles.typeName, active && styles.textOnActive]}>{t.name}</Text>
                  <Text style={[styles.typeCadence, active && styles.textOnActiveMuted]}>
                    {t.cadence}
                  </Text>
                </View>
                <Text style={[styles.typeBlurb, active && styles.textOnActiveMuted]}>{t.blurb}</Text>
                {!t.contentReady ? (
                  <Text style={[styles.typeFlag, active && styles.textOnActiveMuted]}>
                    Uses the Devasi outline for now
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Length" />
        <View style={styles.versionRow}>
          <VersionCard
            title="Brief"
            subtitle="12 steps"
            active={length === "brief"}
            onPress={() => switchLength("brief")}
          />
          <VersionCard
            title="Complete"
            subtitle="48 steps"
            active={length === "complete"}
            onPress={() => switchLength("complete")}
          />
        </View>

        <SectionHeader title="The Six Āvaśyaka" />
        <Card style={{ marginBottom: spacing.xl }}>
          {avashyaka.map((a, index) => (
            <View
              key={a.num}
              style={[styles.avashyakaRow, index === avashyaka.length - 1 && styles.rowLast]}
            >
              <View style={styles.avashyakaNum}>
                <Text style={styles.avashyakaNumText}>{a.num}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.avashyakaName}>{a.name}</Text>
                <Text style={styles.avashyakaGloss}>{a.gloss}</Text>
              </View>
            </View>
          ))}
        </Card>

        <SectionHeader
          title="Your Pratikraman Goal"
          actionLabel={editingGoal ? "Save" : "Edit"}
          onAction={() => (editingGoal ? saveGoalNow() : startEditingGoal())}
        />
        <Card>
          {editingGoal ? (
            <TextInput
              value={goalDraft}
              onChangeText={setGoalDraft}
              multiline
              style={styles.goalInput}
              placeholder="What do you want this practice to bring you?"
              placeholderTextColor={colors.textMuted}
            />
          ) : (
            <Text style={styles.goalText}>{serverGoal || "Set an intention for your practice."}</Text>
          )}
          <Text style={styles.goalHint}>
            Setting a clear intention before you begin helps keep the mind calm and steady through
            each step.
          </Text>
        </Card>
      </AsyncBoundary>
    </ScreenContainer>
  );
}

function VersionCard({
  title,
  subtitle,
  active,
  onPress,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.versionCard, active && styles.versionCardActive]}>
      <Text style={[styles.versionTitle, active && styles.versionTitleActive]}>{title}</Text>
      <Text style={[styles.versionSubtitle, active && styles.versionTitleActive]}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ringWrap: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },

  // Type picker
  typeList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  typeCardActive: {
    backgroundColor: colors.goldDeep,
    borderColor: colors.goldDeep,
  },
  typeCardHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  typeName: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  typeCadence: {
    ...type.bodySm,
    color: colors.textSecondary,
  },
  typeBlurb: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  typeFlag: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  textOnActive: {
    color: colors.cream,
  },
  textOnActiveMuted: {
    color: colors.goldLight,
  },

  // Length toggle
  versionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  versionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  versionCardActive: {
    backgroundColor: colors.goldDeep,
    borderColor: colors.goldDeep,
  },
  versionTitle: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  versionSubtitle: {
    ...type.bodySm,
    color: colors.textSecondary,
  },
  versionTitleActive: {
    color: colors.cream,
  },

  // Six Āvaśyaka
  avashyakaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  avashyakaNum: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avashyakaNumText: {
    ...type.caption,
    color: colors.goldDeep,
  },
  avashyakaName: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  avashyakaGloss: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Goal
  goalText: {
    ...type.bodyMd,
    color: colors.textPrimary,
  },
  goalInput: {
    ...type.bodyMd,
    color: colors.textPrimary,
    minHeight: 60,
  },
  goalHint: {
    ...type.bodySm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Session
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.goldDeep,
  },
  stepCard: {
    marginBottom: spacing.lg,
  },
  stepPhase: {
    ...type.caption,
    color: colors.goldDeep,
    textTransform: "uppercase",
  },
  stepTitle: {
    ...type.displaySm,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  stepInstruction: {
    ...type.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  recitationBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recitationLabel: {
    ...type.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  recitationText: {
    ...type.bodyMd,
    color: colors.textPrimary,
    fontStyle: "italic",
  },
  sessionNav: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
  },
  backBtn: {
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  backBtnText: {
    ...type.labelMd,
    color: colors.textSecondary,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  pauseBtn: {
    alignSelf: "center",
    marginTop: spacing.md,
    padding: spacing.xs,
  },
  pauseText: {
    ...type.labelSm,
    color: colors.goldDeep,
  },
  reviewNote: {
    ...type.bodySm,
    color: colors.textMuted,
    marginTop: spacing.lg,
    fontStyle: "italic",
  },
});
