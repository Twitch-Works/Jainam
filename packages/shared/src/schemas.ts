import { z } from "zod";

/** Request payload validation shared by the API (route schemas) and the app. */

export const pratikramanLengthSchema = z.enum(["brief", "complete"]);
export const pratikramanTypeIdSchema = z.enum([
  "devasi",
  "rai",
  "pakkhi",
  "chaumasi",
  "samvatsari",
]);

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  role: z.string().min(1).max(120).optional(),
  vows: z.array(z.string().min(1).max(40)).max(12).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePratikramanProgressSchema = z.object({
  typeSlug: pratikramanTypeIdSchema,
  length: pratikramanLengthSchema,
  completedSteps: z.number().int().min(0).max(500),
});
export type UpdatePratikramanProgressInput = z.infer<
  typeof updatePratikramanProgressSchema
>;

export const updatePratikramanGoalSchema = z.object({
  goal: z.string().min(1).max(400),
});
export type UpdatePratikramanGoalInput = z.infer<typeof updatePratikramanGoalSchema>;

export const sendChatMessageSchema = z.object({
  text: z.string().min(1).max(2000),
});
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;

/** Ask Jainam history is paged newest-first; `before` is a prior page's cursor. */
export const chatHistoryQuerySchema = z.object({
  // A prior page's `nextCursor` — a Postgres `timestamptz` string (has an offset).
  before: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const pratikramanStepsQuerySchema = z.object({
  type: pratikramanTypeIdSchema.default("devasi"),
  length: pratikramanLengthSchema.default("brief"),
});

export const practiceKindSchema = z.enum(["meditation", "pratikraman", "chant"]);

export const recordPracticeSessionSchema = z.object({
  kind: practiceKindSchema,
  minutes: z.number().int().min(0).max(600).default(0),
  steps: z.number().int().min(0).max(500).default(0),
  mantras: z.number().int().min(0).max(10000).default(0),
});
/** Pre-parse shape — `minutes` / `steps` / `mantras` are optional for callers. */
export type RecordPracticeSessionInput = z.input<typeof recordPracticeSessionSchema>;

export const updatePreferencesSchema = z
  .object({
    pratikramanType: pratikramanTypeIdSchema,
    pratikramanLength: pratikramanLengthSchema,
    lastTab: z.string().max(40),
  })
  .partial();
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
