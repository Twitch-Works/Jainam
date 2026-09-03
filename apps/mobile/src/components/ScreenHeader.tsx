import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors, spacing, type } from "@/theme";
import { ChevronLeftIcon } from "@/components/icons";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Pushed screens show a back chevron; tab screens pass false. */
  showBack?: boolean;
};

export function ScreenHeader({ title, subtitle, showBack = true }: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeftIcon size={22} />
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  back: {
    marginBottom: spacing.sm,
    marginLeft: -4,
  },
  title: {
    ...type.displayLg,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
