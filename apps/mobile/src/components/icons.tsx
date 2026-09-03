import type { ColorValue } from "react-native";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";
import { colors } from "@/theme";

// Custom brand icon set — thin gold line-art (~1.6px stroke) matching the
// logo's mandala style. Extend this file for new icons (AGENTS.md §5); do not
// pull in a generic icon font as the primary icon language.

export type IconProps = {
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
};

type GlyphProps = IconProps & { children: React.ReactNode; viewBox?: string };

function Glyph({
  size = 24,
  color = colors.goldDeep,
  strokeWidth = 1.6,
  viewBox = "0 0 24 24",
  children,
}: GlyphProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <Path d="M9.5 21v-6h5v6" />
    </Glyph>
  );
}

export function MeditateIcon(props: IconProps) {
  // Seated figure in meditation.
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="5.5" r="2.5" />
      <Path d="M12 8.5c-2.4 0-4.2 1.8-4.6 4.2L6.5 18" />
      <Path d="M12 8.5c2.4 0 4.2 1.8 4.6 4.2L17.5 18" />
      <Path d="M4 18.5c2-1.6 4.7-2.5 8-2.5s6 .9 8 2.5" />
      <Path d="M8.5 13.5 12 15l3.5-1.5" />
    </Glyph>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2Z" />
      <Path d="M4 18.5A2 2 0 0 1 6 17h14" />
      <Line x1="12" y1="7.5" x2="12" y2="14.5" />
    </Glyph>
  );
}

export function InsightsIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Line x1="4" y1="20" x2="20" y2="20" />
      <Rect x="5" y="12" width="3.5" height="6" rx="1" />
      <Rect x="10.25" y="8" width="3.5" height="10" rx="1" />
      <Rect x="15.5" y="5" width="3.5" height="13" rx="1" />
    </Glyph>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="8" r="3.5" />
      <Path d="M5 20c.7-3.8 3.5-6 7-6s6.3 2.2 7 6" />
    </Glyph>
  );
}

export function AhimsaHandIcon(props: IconProps) {
  // Open palm (protection / non-violence) with a small wheel at its centre.
  return (
    <Glyph {...props}>
      <Path d="M8 11V5.5a1.25 1.25 0 0 1 2.5 0V10" />
      <Path d="M10.5 10V4.5a1.25 1.25 0 0 1 2.5 0V10" />
      <Path d="M13 10V5.5a1.25 1.25 0 0 1 2.5 0V11" />
      <Path d="M15.5 11V7.5a1.25 1.25 0 0 1 2.5 0v6c0 3.6-2.4 7-6.5 7-2.6 0-4.2-1.2-5.6-3.4l-2-3.4a1.3 1.3 0 0 1 2.2-1.4L8 15" />
      <Circle cx="11.5" cy="13.5" r="1.6" />
    </Glyph>
  );
}

export function DharmachakraIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="12" r="8.5" />
      <Circle cx="12" cy="12" r="2" />
      <Line x1="12" y1="3.5" x2="12" y2="20.5" />
      <Line x1="3.5" y1="12" x2="20.5" y2="12" />
      <Line x1="6" y1="6" x2="18" y2="18" />
      <Line x1="18" y1="6" x2="6" y2="18" />
    </Glyph>
  );
}

export function LotusIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Path d="M12 5c1.8 2 2.7 4.3 2.7 7 0 1-.9 1.9-2.7 2.6-1.8-.7-2.7-1.6-2.7-2.6C9.3 9.3 10.2 7 12 5Z" />
      <Path d="M7 9c.4 2.6 1.6 4.6 3.6 5.9-1.8 1-3.6 1-5.4-.2C4 13.4 4.6 11 7 9Z" />
      <Path d="M17 9c-.4 2.6-1.6 4.6-3.6 5.9 1.8 1 3.6 1 5.4-.2C20 13.4 19.4 11 17 9Z" />
      <Path d="M4 15c1.8 3 4.4 4.5 8 4.5s5.9-1.5 8-4.5" />
    </Glyph>
  );
}

export function ChantIcon(props: IconProps) {
  // Japa mala (prayer beads).
  return (
    <Glyph {...props}>
      <Path d="M6 7.5a8 6 0 1 0 12 0" />
      <Circle cx="6" cy="8" r="1.4" />
      <Circle cx="12" cy="5.5" r="1.4" />
      <Circle cx="18" cy="8" r="1.4" />
      <Circle cx="12" cy="18" r="2.2" />
      <Path d="M10.5 16 12 13l1.5 3" />
    </Glyph>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Path d="M12 3c.5 3-2.5 4.2-2.5 7A2.5 2.5 0 0 0 12 12a2 2 0 0 0 2-2c1 1.2 2 2.8 2 5a6 6 0 0 1-12 0c0-4 3.5-5.5 4-9 .8.6 2 1.8 2 3" />
    </Glyph>
  );
}

export function KundliIcon(props: IconProps) {
  // North-Indian diamond chart glyph.
  return (
    <Glyph {...props}>
      <Rect x="3.5" y="3.5" width="17" height="17" rx="1" />
      <Path d="M3.5 3.5 12 12l8.5-8.5" />
      <Path d="M3.5 20.5 12 12l8.5 8.5" />
      <Path d="M12 3.5 3.5 12 12 20.5 20.5 12Z" />
    </Glyph>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Rect x="4" y="5" width="16" height="16" rx="2" />
      <Line x1="4" y1="9.5" x2="20" y2="9.5" />
      <Line x1="8.5" y1="3" x2="8.5" y2="6.5" />
      <Line x1="15.5" y1="3" x2="15.5" y2="6.5" />
    </Glyph>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Path d="M6.5 17V11a5.5 5.5 0 0 1 11 0v6l1.5 2H5Z" />
      <Path d="M10 20a2 2 0 0 0 4 0" />
    </Glyph>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <Path d="M4.5 12 20 5l-4 15-4.5-6Z" />
      <Line x1="11.5" y1="14" x2="20" y2="5" />
    </Glyph>
  );
}

export function ChevronRightIcon({ color = colors.textMuted, ...props }: IconProps) {
  return (
    <Glyph color={color} {...props}>
      <Polyline points="9 5 16 12 9 19" />
    </Glyph>
  );
}

export function ChevronLeftIcon({ color = colors.textPrimary, ...props }: IconProps) {
  return (
    <Glyph color={color} {...props}>
      <Polyline points="15 5 8 12 15 19" />
    </Glyph>
  );
}

/* ---- Jain principles (Dharmic Essence / Core Practices) ---- */

export function AnekantavadaIcon(props: IconProps) {
  // Many viewpoints, one truth — three interlocking circles.
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="8.5" r="4.5" />
      <Circle cx="8" cy="15" r="4.5" />
      <Circle cx="16" cy="15" r="4.5" />
    </Glyph>
  );
}

export function AparigrahaIcon(props: IconProps) {
  // Non-possessiveness — an open hand letting go.
  return (
    <Glyph {...props}>
      <Path d="M7 13v-2.5a1.2 1.2 0 0 1 2.4 0V12" />
      <Path d="M9.4 12V9a1.2 1.2 0 0 1 2.4 0v3" />
      <Path d="M11.8 12V9.5a1.2 1.2 0 0 1 2.4 0V13" />
      <Path d="M14.2 13v-1.5a1.2 1.2 0 0 1 2.3 0V16c0 2.8-2 4.5-5 4.5-2 0-3.2-.9-4.3-2.6L5.4 15a1.2 1.2 0 0 1 2-1.3L9 15.5" />
      <Path d="M12 3v3" />
      <Path d="M8.5 4 10 6.2" />
      <Path d="M15.5 4 14 6.2" />
    </Glyph>
  );
}

export function SatyaIcon(props: IconProps) {
  // Truthfulness — a check held within a circle.
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="12" r="8.5" />
      <Polyline points="8 12.5 11 15.5 16.5 9" />
    </Glyph>
  );
}

export function StandingFigureIcon(props: IconProps) {
  // Kayotsarga — standing meditation posture (Pratikraman).
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="4.5" r="2" />
      <Path d="M12 6.5v10" />
      <Path d="M12 8.5 8.5 12M12 8.5 15.5 12" />
      <Path d="M12 16.5 9.5 21M12 16.5 14.5 21" />
    </Glyph>
  );
}

export function PlayIcon({ color = colors.goldDeep, ...props }: IconProps) {
  return (
    <Glyph color={color} {...props}>
      <Path d="M8 5.5v13l11-6.5L8 5.5Z" fill={color} />
    </Glyph>
  );
}

export function PauseIcon({ color = colors.goldDeep, ...props }: IconProps) {
  return (
    <Glyph color={color} {...props}>
      <Path d="M8.5 5v14M15.5 5v14" strokeWidth={2.4} />
    </Glyph>
  );
}

export function BrahmacharyaIcon(props: IconProps) {
  // Self-restraint and purity — a seated figure within a guarding arc.
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="7" r="2.2" />
      <Path d="M12 9.2c-2 0-3.4 1.5-3.4 3.6L8 17h8l-.6-4.2c0-2.1-1.4-3.6-3.4-3.6Z" />
      <Path d="M5 19c1.8-1.4 4.2-2.2 7-2.2s5.2.8 7 2.2" />
    </Glyph>
  );
}
