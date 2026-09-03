import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/lib/auth";
import { colors, spacing, type } from "@/theme";

type Mode = "email" | "phone";

export default function SignInScreen() {
  const { signInWithEmail, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Continue your practice."
      footer={
        <Link href="/(auth)/sign-up" style={styles.link}>
          New to Jainam? <Text style={styles.linkStrong}>Create an account</Text>
        </Link>
      }
    >
      <View style={styles.toggle}>
        {(["email", "phone"] as Mode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              setMode(m);
              setError(null);
              setOtpSent(false);
            }}
            style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
              {m === "email" ? "Email" : "Phone"}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "email" ? (
        <>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <PrimaryButton
            label={busy ? "Signing in…" : "Sign in"}
            disabled={busy}
            onPress={() => run(() => signInWithEmail(email.trim(), password))}
          />
        </>
      ) : !otpSent ? (
        <>
          <FormField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="+15555550100"
          />
          <PrimaryButton
            label={busy ? "Sending…" : "Send code"}
            disabled={busy}
            onPress={() =>
              run(async () => {
                await sendPhoneOtp(phone.trim());
                setOtpSent(true);
              })
            }
          />
        </>
      ) : (
        <>
          <FormField
            label={`Code sent to ${phone.trim()}`}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            placeholder="123456"
          />
          <PrimaryButton
            label={busy ? "Verifying…" : "Verify & sign in"}
            disabled={busy}
            onPress={() => run(() => verifyPhoneOtp(phone.trim(), otp.trim()))}
          />
          <Pressable onPress={() => setOtpSent(false)}>
            <Text style={styles.subtle}>Use a different number</Text>
          </Pressable>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleBtnActive: {
    backgroundColor: colors.goldDeep,
    borderColor: colors.goldDeep,
  },
  toggleText: {
    ...type.labelSm,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.cream,
  },
  link: {
    ...type.bodySm,
    color: colors.textSecondary,
  },
  linkStrong: {
    ...type.labelSm,
    color: colors.goldDeep,
  },
  subtle: {
    ...type.bodySm,
    color: colors.goldDeep,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  error: {
    ...type.bodySm,
    color: colors.warning,
    textAlign: "center",
  },
});
