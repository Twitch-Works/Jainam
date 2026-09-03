import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import type { SadhanaGuidanceStep } from "@jainam/shared";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressRing } from "@/components/ProgressRing";
import { colors, radius, spacing, type } from "@/theme";

type Phase = "ready" | "running" | "paused" | "done";

type Props = {
  title: string;
  minutes: number;
  guidance: SadhanaGuidanceStep[];
  busy: boolean;
  /** elapsed minutes (rounded); 0 if ended almost immediately. */
  onFinish: (minutes: number) => void;
};

function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TimerSession({ title, minutes, guidance, busy, onFinish }: Props) {
  const totalSec = Math.max(1, Math.round(minutes * 60));
  const [phase, setPhase] = useState<Phase>("ready");
  const [elapsed, setElapsed] = useState(0);
  useKeepAwake();

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= totalSec) {
          clearInterval(id);
          // defer so we don't setState synchronously inside the updater / effect
          setTimeout(() => {
            setPhase("done");
            onFinish(minutes);
          }, 0);
          return totalSec;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, totalSec, minutes, onFinish]);

  // Weighted schedule: each step's [start, end] in seconds across the session.
  const schedule = useMemo(() => {
    const totalWeight = guidance.reduce((s, g) => s + (g.weight ?? 1), 0) || 1;
    const cumulative = guidance.reduce<number[]>((acc, g) => {
      acc.push((acc.at(-1) ?? 0) + (g.weight ?? 1));
      return acc;
    }, []);
    return guidance.map((_, idx) => ({
      start: ((cumulative[idx - 1] ?? 0) / totalWeight) * totalSec,
      end: (cumulative[idx] / totalWeight) * totalSec,
    }));
  }, [guidance, totalSec]);

  const cue = useMemo(() => {
    if (guidance.length === 0) return null;
    const at = phase === "ready" ? 0 : elapsed;
    const found = schedule.findIndex((s) => at < s.end);
    const i = found === -1 ? guidance.length - 1 : found;
    const seg = schedule[i];
    const within = seg.end > seg.start ? (at - seg.start) / (seg.end - seg.start) : 1;
    return {
      step: guidance[i],
      index: i,
      within: Math.max(0, Math.min(1, within)),
      next: guidance[i + 1]?.heading ?? null,
    };
  }, [guidance, phase, elapsed, schedule]);

  function end() {
    const mins = Math.round(elapsed / 60);
    Alert.alert(
      "End session?",
      mins >= 1 ? `${mins} min will be added to your practice.` : "This won't be logged yet.",
      [
        { text: "Keep going", style: "cancel" },
        { text: "End", style: "destructive", onPress: () => onFinish(mins) },
      ],
    );
  }

  const remaining = Math.max(0, totalSec - elapsed);

  return (
    <View style={styles.wrap}>
      <View style={styles.ringWrap}>
        <ProgressRing
          progress={elapsed / totalSec}
          size={240}
          strokeWidth={10}
          label={phase === "done" ? "Complete" : mmss(remaining)}
          sublabel={phase === "done" ? title : "remaining"}
        />
      </View>

      {cue ? (
        <Card style={styles.cueCard}>
          {guidance.length > 1 ? (
            <Text style={styles.cueCount}>
              Step {cue.index + 1} of {guidance.length}
            </Text>
          ) : null}
          <Text style={styles.cueHeading}>{cue.step.heading}</Text>
          <Text style={styles.cueBody}>{cue.step.body}</Text>
          {guidance.length > 1 && phase !== "ready" && phase !== "done" ? (
            <View style={styles.stepBarTrack}>
              <View style={[styles.stepBarFill, { width: `${cue.within * 100}%` }]} />
            </View>
          ) : null}
          {guidance.length > 1 ? (
            <Text style={styles.cueNext}>
              {cue.next ? `Next · ${cue.next}` : "Final step"}
            </Text>
          ) : null}
        </Card>
      ) : null}

      <View style={styles.controls}>
        {phase === "ready" ? (
          <PrimaryButton label={`Begin ${minutes} min`} onPress={() => setPhase("running")} />
        ) : phase === "done" ? (
          <PrimaryButton label={busy ? "Saving…" : "Done"} disabled={busy} onPress={() => onFinish(minutes)} />
        ) : (
          <View style={styles.row}>
            <Pressable
              onPress={() => setPhase(phase === "running" ? "paused" : "running")}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryText}>{phase === "running" ? "Pause" : "Resume"}</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="End" onPress={end} />
            </View>
          </View>
        )}
      </View>

      <Text style={styles.note}>
        Guided outline — contemplation text should be reviewed against Jain sources.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  ringWrap: { alignItems: "center", marginVertical: spacing.xl },
  cueCard: { marginBottom: spacing.xl },
  cueCount: { ...type.caption, color: colors.textMuted, marginBottom: spacing.xs },
  cueHeading: { ...type.displaySm, color: colors.textPrimary },
  cueBody: { ...type.bodyMd, color: colors.textSecondary, marginTop: spacing.sm },
  stepBarTrack: {
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  stepBarFill: { height: 3, borderRadius: radius.pill, backgroundColor: colors.goldDeep },
  cueNext: { ...type.caption, color: colors.textMuted, marginTop: spacing.sm },
  controls: { marginTop: "auto" },
  row: { flexDirection: "row", alignItems: "stretch", gap: spacing.sm },
  secondaryBtn: {
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  secondaryText: { ...type.labelMd, color: colors.textSecondary },
  note: {
    ...type.bodySm,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
