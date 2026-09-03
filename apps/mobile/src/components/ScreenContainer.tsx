import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";

type ScreenContainerProps = {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (e.g. chat lists). */
  scroll?: boolean;
};

/**
 * Shared screen shell: cream background, top/bottom safe-area padding, and a
 * consistent horizontal gutter. Every tabbed/pushed screen renders inside one.
 */
export function ScreenContainer({ children, scroll = true }: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
});
