import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "@/theme";

type IconTileProps = {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
};

/** Circular icon tile used in the Home quick-actions row. */
export function IconTile({ icon, label, onPress }: IconTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.circle}>{icon}</View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    width: 72,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  label: {
    ...type.labelSm,
    color: colors.textSecondary,
  },
});
