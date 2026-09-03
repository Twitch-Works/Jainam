import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { MeditationSound } from "@jainam/shared";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { MeditationTimer } from "@/components/meditate/MeditationTimer";
import { useMeditationSounds, useRecordPractice } from "@/hooks/data";
import { colors, radius, spacing, type } from "@/theme";

const DURATIONS = [5, 10, 15, 20, 30];

export default function MeditateScreen() {
  const { data, isLoading, error, refetch } = useMeditationSounds();
  const record = useRecordPractice();

  const [minutes, setMinutes] = useState(10);
  const [soundId, setSoundId] = useState<string | null>(null);
  const [session, setSession] = useState<{ minutes: number; sound: MeditationSound } | null>(null);

  const sounds = data?.sounds ?? [];
  const selectedSound = sounds.find((s) => s.id === soundId) ?? sounds[0];

  const leave = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, []);

  const finish = useCallback(
    (mins: number) => {
      if (mins >= 1) record.mutate({ kind: "meditation", minutes: mins }, { onSettled: leave });
      else leave();
    },
    [record, leave],
  );

  if (session) {
    return (
      <ScreenContainer scroll={false}>
        <ScreenHeader title="Meditate" subtitle={`${session.minutes} min`} />
        <MeditationTimer
          minutes={session.minutes}
          sound={session.sound}
          busy={record.isPending}
          onFinish={finish}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Meditate" subtitle="Sit, breathe, and let the day settle." />
      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        <SectionHeader title="Duration" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {DURATIONS.map((m) => {
            const active = m === minutes;
            return (
              <Pressable
                key={m}
                onPress={() => setMinutes(m)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{m} min</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionHeader title="Ambience" />
        <View style={{ gap: spacing.sm }}>
          {sounds.map((s) => {
            const active = s.id === (selectedSound?.id ?? null);
            return (
              <Pressable
                key={s.id}
                onPress={() => setSoundId(s.id)}
                style={[styles.soundCard, active && styles.soundCardActive]}
              >
                <Text style={[styles.soundTitle, active && styles.onActive]}>{s.title}</Text>
                <Text style={[styles.soundDesc, active && styles.onActiveMuted]}>{s.description}</Text>
                {!s.audioUrl && s.id !== "silence" ? (
                  <Text style={[styles.soundFlag, active && styles.onActiveMuted]}>
                    audio coming soon
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          label={`Begin ${minutes} min`}
          style={{ marginTop: spacing.xl }}
          disabled={!selectedSound}
          onPress={() => selectedSound && setSession({ minutes, sound: selectedSound })}
        />
      </AsyncBoundary>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipRow: { marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.goldDeep, borderColor: colors.goldDeep },
  chipText: { ...type.labelMd, color: colors.textSecondary },
  chipTextActive: { color: colors.cream },
  soundCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  soundCardActive: { backgroundColor: colors.goldDeep, borderColor: colors.goldDeep },
  soundTitle: { ...type.labelMd, color: colors.textPrimary },
  soundDesc: { ...type.bodySm, color: colors.textSecondary, marginTop: 2 },
  soundFlag: { ...type.caption, color: colors.textMuted, marginTop: spacing.xs },
  onActive: { color: colors.cream },
  onActiveMuted: { color: colors.goldLight },
});
