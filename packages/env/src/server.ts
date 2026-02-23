import "dotenv/config";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_AUTH_TOKEN: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  CORS_ORIGIN: z.url(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_MODEL: z.string().min(1),
  OPENROUTER_SITE_URL: z.url().optional(),
  OPENROUTER_SITE_NAME: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const runtimeEnv = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

const parsedEnv = serverEnvSchema.safeParse(runtimeEnv);

if (!parsedEnv.success) {
  console.error(
    "Invalid server environment configuration:",
    parsedEnv.error.flatten().fieldErrors,
  );
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      DATABASE_URL: "",
      DATABASE_AUTH_TOKEN: "",
      BETTER_AUTH_SECRET: "",
      BETTER_AUTH_URL: "",
      CORS_ORIGIN: "",
      OPENROUTER_API_KEY: undefined,
      OPENROUTER_MODEL: "",
      OPENROUTER_SITE_URL: undefined,
      OPENROUTER_SITE_NAME: undefined,
      NODE_ENV: "production" as const,
    };
