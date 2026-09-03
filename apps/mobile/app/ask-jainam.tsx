import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  type ListRenderItemInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { ChatMessage, SuggestedPracticeRef } from "@jainam/shared";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { BrandMark } from "@/components/BrandMark";
import { SendIcon, LotusIcon, ChevronRightIcon } from "@/components/icons";
import { colors, radius, spacing, type } from "@/theme";
import { useAuth } from "@/lib/auth";
import { usePersistentDraft } from "@/hooks/usePersistentDraft";
import { useChatMessages, useSendChatMessage } from "@/hooks/data";

/** Deep-link a suggested practice to its guided screen. */
function openPractice(ref: SuggestedPracticeRef) {
  if (ref === "meditate") return router.push("/meditate");
  if (ref === "pratikraman") return router.push("/pratikraman");
  return router.push(`/sadhana/${ref}` as const); // samayik | khayotsarga | anupreksha | japa
}

/** Open whatever follow-up the guru attached to a message — a bhajan wins over a practice. */
function openSuggestion(sp: NonNullable<ChatMessage["suggestedPractice"]>) {
  if (sp.bhajan) return router.push(`/bhajans/${sp.bhajan}` as const);
  if (sp.practice) return openPractice(sp.practice);
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <View style={styles.userBubbleWrap}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  const sp = message.suggestedPractice;
  return (
    <Card style={styles.guruCard}>
      <View style={styles.guruHeader}>
        <View style={styles.guruAvatar}>
          <BrandMark size={22} withMandala={false} color={colors.cream} />
        </View>
        <Text style={styles.guruName}>Jainam</Text>
      </View>
      {message.sanskrit ? (
        <>
          <Text style={styles.sanskrit}>{message.sanskrit.text}</Text>
          <Text style={styles.transliteration}>{message.sanskrit.transliteration}</Text>
          <Text style={styles.translation}>{message.sanskrit.translation}</Text>
          <View style={styles.divider} />
        </>
      ) : null}
      <Text style={styles.guruText}>{message.text}</Text>
      {sp ? (
        <View style={styles.suggestedWrap}>
          <Text style={styles.suggestedLabel}>
            {sp.bhajan ? "Suggested Bhajan" : "Suggested Practice"}
          </Text>
          {sp.bhajan || sp.practice ? (
            <Pressable
              onPress={() => openSuggestion(sp)}
              style={({ pressed }) => [styles.suggestedTile, pressed && styles.suggestedTilePressed]}
              accessibilityRole="button"
              accessibilityHint={sp.bhajan ? "Opens this bhajan in the app" : "Opens this practice in the app"}
            >
              <LotusIcon size={18} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestedTitle}>{sp.title}</Text>
                <Text style={styles.suggestedDescription}>{sp.description}</Text>
                <Text style={styles.suggestedCta}>
                  {sp.bhajan ? "Listen in the app" : "Begin in the app"}
                </Text>
              </View>
              <ChevronRightIcon color={colors.goldDeep} />
            </Pressable>
          ) : (
            <View style={styles.suggestedRow}>
              <LotusIcon size={18} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestedTitle}>{sp.title}</Text>
                <Text style={styles.suggestedDescription}>{sp.description}</Text>
              </View>
            </View>
          )}
        </View>
      ) : null}
    </Card>
  );
}

/** Shown at the bottom of the thread while the guru reply is in flight. */
function TypingBubble() {
  return (
    <View style={styles.typingWrap}>
      <View style={styles.guruAvatar}>
        <BrandMark size={18} withMandala={false} color={colors.cream} />
      </View>
      <View style={styles.typingBubble}>
        <ActivityIndicator size="small" color={colors.goldDeep} />
        <Text style={styles.typingText}>Jainam is reflecting…</Text>
      </View>
    </View>
  );
}

export default function AskJainamScreen() {
  const { user } = useAuth();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessages();
  const send = useSendChatMessage();
  const [draft, setDraft] = usePersistentDraft(`ask-jainam-draft:${user?.id ?? "anon"}`);

  // Newest → oldest, ready for the inverted list (newest sits at the bottom).
  const messages = data?.pages.flatMap((p) => p.messages) ?? [];

  function handleSend() {
    const text = draft.trim();
    if (!text || send.isPending) return;
    setDraft("");
    send.mutate(text, {
      onError: () => {
        setDraft(text); // don't lose what they typed
        Alert.alert("Couldn't send", "Your message didn't go through. Please try again.");
      },
    });
  }

  const loadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => <MessageBubble message={item} />,
    [],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.headerWrap}>
          <ScreenHeader title="Ask Jainam" subtitle="Your inner dialogue, guided by Jain wisdom." />
        </View>

        <FlatList
          data={messages}
          inverted
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={loadOlder}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={send.isPending ? <TypingBubble /> : null}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.goldDeep} style={styles.olderSpinner} />
            ) : null
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask anything..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={draft.trim().length === 0 || send.isPending}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={({ pressed }) => [
              styles.sendButton,
              (draft.trim().length === 0 || send.isPending) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            <SendIcon size={20} color={colors.cream} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
  },
  messages: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  olderSpinner: {
    paddingVertical: spacing.md,
  },
  typingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  typingText: {
    ...type.bodySm,
    color: colors.textSecondary,
  },
  userBubbleWrap: {
    alignItems: "flex-end",
  },
  userBubble: {
    backgroundColor: colors.goldDeep,
    borderRadius: radius.lg,
    borderBottomRightRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: "85%",
  },
  userText: {
    ...type.bodyMd,
    color: colors.cream,
  },
  guruHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  guruAvatar: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.goldDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  guruName: {
    ...type.labelSm,
    color: colors.textSecondary,
  },
  guruCard: {
    backgroundColor: colors.surfaceMuted,
  },
  sanskrit: {
    ...type.displaySm,
    color: colors.brown,
  },
  transliteration: {
    ...type.labelMd,
    color: colors.textPrimary,
    marginTop: 4,
  },
  translation: {
    ...type.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  guruText: {
    ...type.bodyMd,
    color: colors.textPrimary,
  },
  suggestedWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestedLabel: {
    ...type.caption,
    color: colors.goldDeep,
    marginBottom: spacing.xs,
  },
  suggestedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  suggestedTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldDeep,
    backgroundColor: colors.surface,
  },
  suggestedTilePressed: {
    opacity: 0.6,
  },
  suggestedCta: {
    ...type.caption,
    color: colors.goldDeep,
    marginTop: 4,
  },
  suggestedTitle: {
    ...type.labelMd,
    color: colors.textPrimary,
  },
  suggestedDescription: {
    ...type.bodySm,
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    ...type.bodyMd,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.goldDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonPressed: {
    opacity: 0.7,
  },
});
