import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import type { MeditationSound } from "@jainam/shared";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressRing } from "@/components/ProgressRing";
import { colors, radius, spacing, type } from "@/theme";

type Phase = "running" | "paused" | "done";

type Props = {
  minutes: number;
  sound: MeditationSound;
  busy: boolean;
  onFinish: (minutes: number) => void;
};

function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MeditationTimer({ minutes, sound, busy, onFinish }: Props) {
  const totalSec = Math.max(1, Math.round(minutes * 60));
  const [phase, setPhase] = useState<Phase>("running");
  const [elapsed, setElapsed] = useState(0);
  useKeepAwake();

  const player = useAudioPlayer(sound.audioUrl ? { uri: sound.audioUrl } : null);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // expo-audio exposes looping as a settable property on the player.
    // eslint-disable-next-line react-hooks/immutability
    player.loop = sound.loop;
  }, [player, sound.loop]);

  useEffect(() => {
    if (!sound.audioUrl) return;
    try {
      if (phase === "running") player.play();
      else player.pause();
    } catch {
      /* player not ready — ignore */
    }
  }, [phase, sound.audioUrl, player]);

  // stop audio when leaving the screen
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {
        /* ignore */
      }
    };
  }, [player]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= totalSec) {
          clearInterval(id);
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

  function end() {
    const mins = Math.round(elapsed / 60);
    Alert.alert(
      "End meditation?",
      mins >= 1 ? `${mins} min will be added to your practice.` : "This won't be logged yet.",
      [
        { text: "Keep sitting", style: "cancel" },
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
          size={248}
          strokeWidth={10}
          label={phase === "done" ? "Complete" : mmss(remaining)}
          sublabel={sound.title}
        />
      </View>

      <Text style={styles.ambience}>
        {sound.audioUrl
          ? sound.description
          : `${sound.title} audio is coming soon — sitting in silence for now.`}
      </Text>

      <View style={styles.controls}>
        {phase === "done" ? (
          <PrimaryButton
            label={busy ? "Saving…" : "Done"}
            disabled={busy}
            onPress={() => onFinish(minutes)}
          />
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  ringWrap: { alignItems: "center", marginVertical: spacing.xxl },
  ambience: {
    ...type.bodyMd,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
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
});
