import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, type } from "@/theme";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Gold-gradient pill button — the single primary action per screen. */
export function PrimaryButton({ label, onPress, disabled, style }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.wrap,
        (pressed || disabled) && styles.dim,
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.goldLight, colors.gold, colors.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  dim: {
    opacity: 0.7,
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...type.labelMd,
    color: colors.cream,
  },
});
