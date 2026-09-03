import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

// The Jainam brand mark — Ahimsā hand (with ॐ) inside a lotus/mandala border,
// gold line art. Source vectors: `apps/mobile/assets/brand/*.svg` (raster-in-SVG
// exports); these PNGs are the trimmed, transparent renders of them.
import MARK from "../../assets/images/brand-mark.png";
import MARK_PLAIN from "../../assets/images/brand-mark-plain.png";

type BrandMarkProps = {
  size?: number;
  /**
   * Recolour the line art — used where the mark sits on a coloured chip
   * (e.g. cream on the gold guru avatar). Omit for the natural gold artwork.
   */
  color?: string;
  /** Drop the mandala/lotus border and render just the hand mark. */
  withMandala?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BrandMark({ size = 40, color, withMandala = true, style }: BrandMarkProps) {
  return (
    <View style={[{ width: size, height: size }, styles.center, style]}>
      <Image
        source={withMandala ? MARK : MARK_PLAIN}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        style={{ width: size, height: size, tintColor: color }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
