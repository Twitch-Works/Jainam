import { useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { TimerSession } from "@/components/sadhana/TimerSession";
import { JapaSession } from "@/components/sadhana/JapaSession";
import { useRecordPractice, useSadhana } from "@/hooks/data";

export default function SadhanaSessionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, isLoading, error, refetch } = useSadhana();
  const record = useRecordPractice();

  const practice =
    data?.practices.find((p) => p.id === slug) ??
    (data?.suggested?.id === slug ? data.suggested : undefined);

  const leave = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/sadhana");
  }, []);

  const finishTimer = useCallback(
    (minutes: number) => {
      if (minutes >= 1) {
        record.mutate({ kind: "meditation", minutes }, { onSettled: leave });
      } else {
        leave();
      }
    },
    [record, leave],
  );

  const finishJapa = useCallback(
    (mantras: number) => {
      if (mantras >= 1) {
        record.mutate({ kind: "chant", mantras }, { onSettled: leave });
      } else {
        leave();
      }
    },
    [record, leave],
  );

  return (
    <ScreenContainer scroll={false}>
      <ScreenHeader title={practice?.title ?? "Practice"} subtitle={practice?.description} />
      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        {practice ? (
          practice.sessionKind === "chant" ? (
            <JapaSession
              title={practice.title}
              target={practice.sessionMantras ?? 108}
              mantra={practice.mantra}
              busy={record.isPending}
              onFinish={finishJapa}
            />
          ) : (
            <TimerSession
              title={practice.title}
              minutes={practice.sessionMinutes ?? 10}
              guidance={practice.guidance ?? []}
              busy={record.isPending}
              onFinish={finishTimer}
            />
          )
        ) : null}
      </AsyncBoundary>
    </ScreenContainer>
  );
}
