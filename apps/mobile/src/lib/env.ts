export type AppEnv = "development" | "test" | "production";

const raw = (process.env.EXPO_PUBLIC_APP_ENV ?? "development").toLowerCase();

export const APP_ENV: AppEnv =
  raw === "production" || raw === "test" ? raw : "development";

/** True for development and test — where dev conveniences (skip email
 *  confirmation, verbose errors) are allowed. */
export const IS_DEV_ENV = APP_ENV !== "production";
