import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing, type } from "@/theme";

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

/** Pill chip for category filters and vow tags. */
export function Chip({ label, active = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.goldDeep,
    borderColor: colors.goldDeep,
  },
  label: {
    ...type.labelSm,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.cream,
  },
});
