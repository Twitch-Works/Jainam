import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * A `useState<string>` that hydrates from and mirrors to on-device storage,
 * so an unsent text input survives navigating away or restarting the app.
 * Per-device only (not synced) — pass a user-scoped `key`.
 */
export function usePersistentDraft(key: string): readonly [string, (next: string) => void] {
  const [value, setValue] = useState("");
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    hydrated.current = false;
    AsyncStorage.getItem(key)
      .then((stored) => {
        if (!cancelled && stored != null) setValue(stored);
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    const write = value
      ? AsyncStorage.setItem(key, value)
      : AsyncStorage.removeItem(key);
    write.catch(() => {});
  }, [key, value]);

  return [value, setValue] as const;
}
