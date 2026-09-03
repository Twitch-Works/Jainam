import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "@/theme";
import { ChevronRightIcon } from "@/components/icons";

type PracticeListItemProps = {
  icon: ReactNode;
  title: string;
  description: string;
  duration: string;
  onPress?: () => void;
};

/** Tappable practice row — structured so a guided-practice player can slot in later. */
export function PracticeListItem({
  icon,
  title,
  description,
  duration,
  onPress,
}: PracticeListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${duration}`}
    >
      <View style={styles.iconChip}>{icon}</View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.duration}>{duration}</Text>
        <ChevronRightIcon size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  title: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  description: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    alignItems: "flex-end",
    gap: spacing.xxs,
  },
  duration: {
    ...type.bodySm,
    color: colors.textMuted,
  },
});
