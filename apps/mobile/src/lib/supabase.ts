import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.\n" +
      "Copy apps/mobile/.env.example to apps/mobile/.env and fill it in (run `pnpm db:start` for local values).",
  );
}

/**
 * SecureStore caps a single value at ~2KB; Supabase sessions can exceed that,
 * so we chunk. Web has no SecureStore → fall back to AsyncStorage.
 */
const CHUNK = 1800;

const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const head = await SecureStore.getItemAsync(key);
    if (head === null) return null;
    if (!head.startsWith("__chunked__:")) return head;
    const count = Number(head.slice("__chunked__:".length));
    let out = "";
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}__${i}`);
      if (part === null) return null;
      out += part;
    }
    return out;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const count = Math.ceil(value.length / CHUNK);
    await SecureStore.setItemAsync(key, `__chunked__:${count}`);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${key}__${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK));
    }
  },
  async removeItem(key: string): Promise<void> {
    const head = await SecureStore.getItemAsync(key);
    await SecureStore.deleteItemAsync(key);
    if (head?.startsWith("__chunked__:")) {
      const count = Number(head.slice("__chunked__:".length));
      for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${key}__${i}`);
    }
  },
};

const options: SupabaseClientOptions<"public"> = {
  auth: {
    storage: Platform.OS === "web" ? AsyncStorage : secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
};

export const supabase = createClient(url, anonKey, options);

// On native, the token-refresh timer only runs while the app is foregrounded.
// Toggle it with AppState so a session that was persisted across a cold start
// (or a long background) refreshes instead of silently expiring.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
