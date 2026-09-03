import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useKeepAwake } from "expo-keep-awake";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { PlayIcon, PauseIcon } from "@/components/icons";
import { useBhajan } from "@/hooks/data";
import { colors, radius, spacing, type } from "@/theme";

function mmss(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BhajanDetailScreen() {
  const params = useLocalSearchParams<{ number: string }>();
  const number = Number.parseInt(params.number ?? "", 10);
  const { data, isLoading, error, refetch } = useBhajan(number);
  useKeepAwake();

  const player = useAudioPlayer(data?.audioUrl ? { uri: data.audioUrl } : null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => {});
  }, []);

  // Stop playback when leaving the screen.
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {
        /* player already gone */
      }
    };
  }, [player]);

  function toggle() {
    try {
      if (status.playing) player.pause();
      else {
        if (status.didJustFinish || status.currentTime >= status.duration) player.seekTo(0);
        player.play();
      }
    } catch {
      /* not ready yet */
    }
  }

  const hasAudio = Boolean(data?.audioUrl);
  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;

  return (
    <ScreenContainer>
      <ScreenHeader title={data ? `#${data.number}` : "Bhajan"} />
      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        {data ? (
          <>
            <Text style={styles.title}>{data.title}</Text>
            {data.tune && data.tune !== data.title ? (
              <Text style={styles.tune}>Tune: {data.tune}</Text>
            ) : null}

            <Card style={styles.player}>
              <Pressable
                onPress={toggle}
                disabled={!hasAudio}
                style={[styles.playButton, !hasAudio && styles.playButtonDisabled]}
                accessibilityRole="button"
                accessibilityLabel={status.playing ? "Pause bhajan" : "Play bhajan"}
              >
                {status.playing ? (
                  <PauseIcon size={26} color={colors.cream} />
                ) : (
                  <PlayIcon size={26} color={colors.cream} />
                )}
              </Pressable>

              <View style={styles.playBody}>
                {hasAudio ? (
                  <>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                    </View>
                    <View style={styles.times}>
                      <Text style={styles.time}>{mmss(status.currentTime)}</Text>
                      <Text style={styles.time}>
                        {status.isLoaded ? mmss(status.duration) : "--:--"}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noAudio}>Audio for this bhajan isn’t available yet.</Text>
                )}
              </View>
            </Card>

            {data.needsReview ? (
              <Text style={styles.reviewNote}>
                These lyrics are still being verified{data.reviewNotes ? ` — ${data.reviewNotes}` : ""}.
              </Text>
            ) : null}

            <View style={styles.lyrics}>
              {data.lyricsLines.map((line, i) => (
                <Text key={i} style={styles.line}>
                  {line.text}
                </Text>
              ))}
            </View>
          </>
        ) : null}
      </AsyncBoundary>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.displaySm,
    color: colors.textPrimary,
  },
  tune: {
    ...type.bodySm,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  player: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.goldDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonDisabled: {
    opacity: 0.4,
  },
  playBody: {
    flex: 1,
    gap: spacing.xs,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.goldDeep,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    ...type.caption,
    color: colors.textMuted,
  },
  noAudio: {
    ...type.bodySm,
    color: colors.textMuted,
  },
  reviewNote: {
    ...type.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  lyrics: {
    gap: spacing.sm,
  },
  line: {
    ...type.bodyMd,
    color: colors.textPrimary,
    lineHeight: 28,
  },
});
