import { View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PracticeListItem } from "@/components/PracticeListItem";
import { AsyncBoundary } from "@/components/AsyncBoundary";
import { iconForKey } from "@/components/iconForKey";
import { useSadhana } from "@/hooks/data";
import { spacing } from "@/theme";

export default function SadhanaScreen() {
  const { data, isLoading, error, refetch } = useSadhana();

  return (
    <ScreenContainer>
      <ScreenHeader title="Sadhana" subtitle="Your daily spiritual practice" showBack={false} />
      <AsyncBoundary loading={isLoading} error={error} onRetry={refetch}>
        <View style={{ marginTop: spacing.xs }}>
          {(data?.practices ?? []).map((practice) => {
            const Icon = iconForKey[practice.icon];
            // Pratikramaṇa has its own step player; every other practice opens a
            // guided timer / japa session.
            const href =
              practice.id === "pratikraman" ? "/pratikraman" : (`/sadhana/${practice.id}` as const);
            return (
              <PracticeListItem
                key={practice.id}
                icon={<Icon />}
                title={practice.title}
                description={practice.description}
                duration={practice.duration}
                onPress={() => router.push(href)}
              />
            );
          })}
        </View>
      </AsyncBoundary>
    </ScreenContainer>
  );
}
