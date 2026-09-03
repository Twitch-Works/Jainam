import { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import type { SanskritBlock } from "@jainam/shared";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressRing } from "@/components/ProgressRing";
import { colors, radius, spacing, type } from "@/theme";

type Props = {
  title: string;
  target: number;
  mantra?: SanskritBlock;
  busy: boolean;
  onFinish: (count: number) => void;
};

export function JapaSession({ title, target, mantra, busy, onFinish }: Props) {
  const [count, setCount] = useState(0);
  const [scale] = useState(() => new Animated.Value(1));
  useKeepAwake();

  const done = count >= target;

  function bump() {
    if (done) return;
    const next = count + 1;
    setCount(next);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
    if (next >= target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => onFinish(next), 700);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }

  return (
    <View style={styles.wrap}>
      {mantra ? (
        <Card style={styles.mantraCard}>
          <Text style={styles.mantraText}>{mantra.text}</Text>
          <Text style={styles.mantraTranslit}>{mantra.transliteration}</Text>
          <Text style={styles.mantraTranslation}>{mantra.translation}</Text>
        </Card>
      ) : null}

      <Pressable onPress={bump} style={styles.beadWrap} accessibilityRole="button" accessibilityLabel="Count a bead">
        <Animated.View style={{ transform: [{ scale }] }}>
          <ProgressRing
            progress={target ? count / target : 0}
            size={248}
            strokeWidth={12}
            label={done ? "Complete" : String(count)}
            sublabel={done ? title : `of ${target}`}
          />
        </Animated.View>
      </Pressable>
      <Text style={styles.hint}>{done ? "Mālā complete 🙏" : "Tap the circle for each repetition"}</Text>

      <View style={styles.controls}>
        <Pressable
          onPress={() => setCount((c) => Math.max(0, c - 1))}
          disabled={count === 0 || done}
          style={[styles.undoBtn, (count === 0 || done) && styles.disabled]}
        >
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label={busy ? "Saving…" : done ? "Finish" : `Finish at ${count}`}
            disabled={busy || count === 0}
            onPress={() => onFinish(count)}
          />
        </View>
      </View>

      <Text style={styles.note}>Mantra text should be reviewed against Jain sources.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  mantraCard: { alignItems: "center", marginTop: spacing.sm },
  mantraText: { ...type.displayMd, color: colors.textPrimary, textAlign: "center" },
  mantraTranslit: { ...type.labelMd, color: colors.textPrimary, marginTop: spacing.xs },
  mantraTranslation: {
    ...type.bodySm,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
    textAlign: "center",
  },
  beadWrap: { alignItems: "center", marginVertical: spacing.xl },
  hint: { ...type.bodySm, color: colors.textMuted, textAlign: "center" },
  controls: { flexDirection: "row", alignItems: "stretch", gap: spacing.sm, marginTop: "auto" },
  undoBtn: {
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  undoText: { ...type.labelMd, color: colors.textSecondary },
  disabled: { opacity: 0.4 },
  note: {
    ...type.bodySm,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
