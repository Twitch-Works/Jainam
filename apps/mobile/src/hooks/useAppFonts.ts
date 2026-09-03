import {
  useFonts,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

/**
 * Loads the two brand typefaces (Playfair Display + Inter) used across the
 * app. The root layout gates rendering behind this so no screen paints with a
 * fallback system font. Returns `true` once both families are ready.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return loaded;
}
