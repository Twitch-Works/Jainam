import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, type } from "@/theme";

type ProgressRingProps = {
  /** 0–1. Values outside the range are clamped. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  centerIcon?: ReactNode;
  label?: string;
  sublabel?: string;
};

export function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 10,
  centerIcon,
  label,
  sublabel,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.goldDeep}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.center}>
        {centerIcon}
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...type.displayMd,
    color: colors.textPrimary,
    marginTop: 4,
  },
  sublabel: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
