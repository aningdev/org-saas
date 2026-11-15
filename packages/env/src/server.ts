import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnvSchema = {
  DATABASE_URL: z
    .url()
    .refine((value) => ["postgres:", "postgresql:"].includes(new URL(value).protocol), {
      message: "DATABASE_URL must use the postgres or postgresql protocol",
    }),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  CORS_ORIGIN: z.url(),
  /** Resend API key; optional until email verification / password reset are required in deploy. */
  RESEND_API_KEY: z.string().min(1).optional(),
  /** Verified sender address for Resend, e.g. `Org SaaS <noreply@example.com>`. */
  EMAIL_FROM: z.string().min(3).optional(),
  /**
   * When true and Resend is configured, block email/password sign-in until the address is verified.
   * Defaults false so local/CI and pre-mail deploys keep working.
   */
  REQUIRE_EMAIL_VERIFICATION: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  /**
   * Comma-separated proxy IPs/CIDRs that may append `X-Forwarded-For`.
   * Required behind a reverse proxy so Better Auth rate limits use the real client IP
   * instead of a shared no-IP bucket (or a client-spoofed leftmost hop).
   */
  AUTH_TRUSTED_PROXIES: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  NODE_ENV: z.enum(["dev", "development", "prod", "production", "test"]).default("dev"),
};

export const env = createEnv({
  server: serverEnvSchema,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
