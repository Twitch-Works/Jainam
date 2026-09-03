// The ONLY source of design tokens. Import from "@/theme" everywhere —
// never hardcode a hex value, font family, font size, or spacing number in a
// screen or component (AGENTS.md §5).
export { colors } from "./colors";
export type { ColorToken } from "./colors";
export { spacing, radius } from "./spacing";
export { fontFamily, type } from "./typography";
