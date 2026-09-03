import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAppFonts } from "@/hooks/useAppFonts";
import { AuthProvider, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/query";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op: safe to ignore if already hidden */
});

function RootNavigator() {
  const { session, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, initializing, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="ask-jainam" options={{ presentation: "card" }} />
      <Stack.Screen name="meditate" options={{ presentation: "card" }} />
      <Stack.Screen name="bhajans" options={{ presentation: "card" }} />
      <Stack.Screen name="bhajans/[number]" options={{ presentation: "card" }} />
      <Stack.Screen name="pratikraman" options={{ presentation: "card" }} />
      <Stack.Screen name="sadhana/[slug]" options={{ presentation: "card" }} />
      <Stack.Screen name="kundli" options={{ presentation: "card" }} />
      <Stack.Screen name="calendar" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <StatusBar style="dark" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </View>
  );
}
