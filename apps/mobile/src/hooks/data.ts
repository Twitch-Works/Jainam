import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type {
  Avashyaka,
  BhajanDetail,
  BhajanSummary,
  CalendarEvent,
  ChatHistoryPage,
  ChatMessage,
  ConsistencyPoint,
  KundliData,
  LibraryContent,
  Me,
  MeditationSound,
  PratikramanLength,
  PratikramanProgress,
  PratikramanStep,
  PratikramanType,
  PratikramanTypeId,
  RecordPracticeResult,
  RecordPracticeSessionInput,
  SadhanaPractice,
  ThoughtOfTheDay,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UserPreferences,
  UserStats,
} from "@jainam/shared";
import { api } from "@/lib/api";

// ── User ───────────────────────────────────────────────────────────────────
export const useMe = () => useQuery({ queryKey: ["me"], queryFn: () => api.get<Me>("/api/me") });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<Me>("/api/me", input),
    onSuccess: (me) => qc.setQueryData(["me"], me),
  });
}

export const useInsights = () =>
  useQuery({
    queryKey: ["insights"],
    queryFn: () => api.get<{ stats: UserStats; consistency: ConsistencyPoint[] }>("/api/insights"),
  });

// ── Preferences (synced app state that should survive a restart) ────────────
export const usePreferences = () =>
  useQuery({
    queryKey: ["preferences"],
    queryFn: () => api.get<{ preferences: UserPreferences }>("/api/me/preferences"),
    staleTime: 5 * 60_000,
  });

export function useSavePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdatePreferencesInput) =>
      api.put<{ preferences: UserPreferences }>("/api/me/preferences", patch),
    onSuccess: (data) => qc.setQueryData(["preferences"], data),
  });
}

/** Log a completed practice session — updates stats / consistency / XP server-side. */
export function useRecordPractice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordPracticeSessionInput) =>
      api.post<RecordPracticeResult>("/api/practice/sessions", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

// ── Sadhana ────────────────────────────────────────────────────────────────
export const useSadhana = () =>
  useQuery({
    queryKey: ["sadhana"],
    queryFn: () =>
      api.get<{ practices: SadhanaPractice[]; suggested: SadhanaPractice | null }>("/api/sadhana"),
  });

export const useMeditationSounds = () =>
  useQuery({
    queryKey: ["meditate", "sounds"],
    queryFn: () => api.get<{ sounds: MeditationSound[] }>("/api/meditate/sounds"),
    staleTime: 10 * 60_000,
  });

// ── Bhajans ────────────────────────────────────────────────────────────────
export const useBhajans = () =>
  useQuery({
    queryKey: ["bhajans"],
    queryFn: () => api.get<{ bhajans: BhajanSummary[] }>("/api/bhajans"),
    staleTime: 10 * 60_000,
  });

export const useBhajan = (number: number) =>
  useQuery({
    queryKey: ["bhajans", number],
    queryFn: () => api.get<BhajanDetail>(`/api/bhajans/${number}`),
    enabled: Number.isInteger(number) && number > 0,
    // The audio URL is a signed link valid ~6h; no need to refetch aggressively.
    staleTime: 60 * 60_000,
  });

// ── Wisdom ─────────────────────────────────────────────────────────────────
export const useThoughtOfTheDay = () =>
  useQuery({ queryKey: ["wisdom", "thought"], queryFn: () => api.get<ThoughtOfTheDay>("/api/wisdom/thought") });

export const useLibrary = () =>
  useQuery({ queryKey: ["wisdom", "library"], queryFn: () => api.get<LibraryContent>("/api/wisdom/library") });

// ── Kundli / Calendar ──────────────────────────────────────────────────────
export const useKundli = () =>
  useQuery({ queryKey: ["kundli"], queryFn: () => api.get<KundliData>("/api/kundli") });

export const useCalendar = () =>
  useQuery({
    queryKey: ["calendar"],
    queryFn: () => api.get<{ events: CalendarEvent[] }>("/api/calendar"),
  });

// ── Pratikramaṇa ───────────────────────────────────────────────────────────
export const usePratikramanTypes = () =>
  useQuery({
    queryKey: ["pratikraman", "types"],
    queryFn: () => api.get<{ types: PratikramanType[] }>("/api/pratikraman/types"),
  });

export const usePratikramanAvashyaka = () =>
  useQuery({
    queryKey: ["pratikraman", "avashyaka"],
    queryFn: () => api.get<{ avashyaka: Avashyaka[] }>("/api/pratikraman/avashyaka"),
  });

export const usePratikramanSteps = (type: PratikramanTypeId, length: PratikramanLength) =>
  useQuery({
    queryKey: ["pratikraman", "steps", type, length],
    queryFn: () =>
      api.get<{ steps: PratikramanStep[] }>(
        `/api/pratikraman/steps?type=${type}&length=${length}`,
      ),
  });

export const usePratikramanProgress = () =>
  useQuery({
    queryKey: ["pratikraman", "progress"],
    queryFn: () => api.get<{ progress: PratikramanProgress[] }>("/api/pratikraman/progress"),
  });

export function useSavePratikramanProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PratikramanProgress) => api.put("/api/pratikraman/progress", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pratikraman", "progress"] }),
  });
}

export const usePratikramanGoal = () =>
  useQuery({
    queryKey: ["pratikraman", "goal"],
    queryFn: () => api.get<{ goal: string }>("/api/pratikraman/goal"),
  });

export function useSavePratikramanGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goal: string) => api.put<{ goal: string }>("/api/pratikraman/goal", { goal }),
    onSuccess: (data) => qc.setQueryData(["pratikraman", "goal"], data),
  });
}

// ── Ask Jainam ─────────────────────────────────────────────────────────────
const CHAT_KEY = ["ask-jainam", "messages"] as const;
const CHAT_PAGE_SIZE = 10;

/**
 * Ask Jainam history, paged newest-first. One page (10) loads on open; older
 * pages are pulled via `fetchNextPage()` as the user scrolls up. Flatten with
 * `data.pages.flatMap((p) => p.messages)` — the result is newest → oldest,
 * ready for an inverted list.
 */
export const useChatMessages = () =>
  useInfiniteQuery({
    queryKey: CHAT_KEY,
    queryFn: ({ pageParam }) =>
      api.get<ChatHistoryPage>(
        `/api/ask-jainam/messages?limit=${CHAT_PAGE_SIZE}` +
          (pageParam ? `&before=${encodeURIComponent(pageParam)}` : ""),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
  });

type ChatData = InfiniteData<ChatHistoryPage, string | null>;

/** Prepend messages to the newest (first) page, creating the page if needed. */
function prependToFirstPage(data: ChatData | undefined, msgs: ChatMessage[]): ChatData {
  if (!data || data.pages.length === 0) {
    return { pageParams: [null], pages: [{ messages: msgs, hasMore: false, nextCursor: null }] };
  }
  const [first, ...rest] = data.pages;
  return { ...data, pages: [{ ...first, messages: [...msgs, ...first.messages] }, ...rest] };
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      api.post<{ userMessage: ChatMessage | null; guruMessage: ChatMessage | null }>(
        "/api/ask-jainam/messages",
        { text },
      ),
    // Show the user's message immediately, before the guru reply comes back.
    onMutate: async (text: string) => {
      await qc.cancelQueries({ queryKey: CHAT_KEY });
      const prev = qc.getQueryData<ChatData>(CHAT_KEY);
      const optimisticId = `pending:${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        role: "user",
        text,
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<ChatData>(CHAT_KEY, (curr) => prependToFirstPage(curr, [optimistic]));
      return { prev, optimisticId };
    },
    onSuccess: (res, _text, ctx) => {
      const real = [res.guruMessage, res.userMessage].filter((m): m is ChatMessage => m !== null);
      qc.setQueryData<ChatData>(CHAT_KEY, (curr) => {
        if (!curr) return curr;
        // Swap the optimistic bubble for the persisted user + guru messages.
        const pruned: ChatData = {
          ...curr,
          pages: curr.pages.map((p) => ({
            ...p,
            messages: p.messages.filter((m) => m.id !== ctx?.optimisticId),
          })),
        };
        return prependToFirstPage(pruned, real);
      });
    },
    onError: (_err, _text, ctx) => {
      // Roll back the optimistic bubble.
      qc.setQueryData<ChatData>(CHAT_KEY, (curr) => {
        if (!curr) return ctx?.prev;
        return {
          ...curr,
          pages: curr.pages.map((p) => ({
            ...p,
            messages: p.messages.filter((m) => m.id !== ctx?.optimisticId),
          })),
        };
      });
    },
  });
}
