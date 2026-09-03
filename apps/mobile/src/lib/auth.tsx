import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { api, ApiError } from "./api";
import { IS_DEV_ENV } from "./env";

export type SignUpResult =
  | { status: "signed-in" }
  | { status: "confirm-email"; email: string }
  | { status: "exists" };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<SignUpResult>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function throwIf<T extends { error: { message: string } | null }>(result: T): T {
  if (result.error) throw new Error(result.error.message);
  return result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      initializing,
      async signInWithEmail(email, password) {
        throwIf(await supabase.auth.signInWithPassword({ email, password }));
      },
      async signUpWithEmail(email, password, name): Promise<SignUpResult> {
        // Dev/test: the API creates an already-confirmed user (no email link),
        // then we sign in normally.
        if (IS_DEV_ENV) {
          try {
            await api.post("/api/dev/sign-up", { email, password, name });
          } catch (e) {
            if (e instanceof ApiError && e.status === 409) return { status: "exists" };
            throw e;
          }
          throwIf(await supabase.auth.signInWithPassword({ email, password }));
          return { status: "signed-in" };
        }

        // Production: real signup with email confirmation.
        const { data } = throwIf(
          await supabase.auth.signUp({ email, password, options: { data: { name } } }),
        );
        if (data.session) return { status: "signed-in" };
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          return { status: "exists" };
        }
        return { status: "confirm-email", email };
      },
      async sendPhoneOtp(phone) {
        throwIf(await supabase.auth.signInWithOtp({ phone }));
      },
      async verifyPhoneOtp(phone, token) {
        throwIf(await supabase.auth.verifyOtp({ phone, token, type: "sms" }));
      },
      async signOut() {
        throwIf(await supabase.auth.signOut());
      },
    }),
    [session, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
