import { env } from "@image-gen/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z, ZodError } from "zod";

import { allowedImageSizes, assertOpenRouterConfigured, generateWithOpenRouter } from "@/lib/openrouter";
import { buildPromptPayload, promptRequestSchema } from "@/lib/prompt-builder";

const app = new Hono();

function isAuthConfigured() {
  return Boolean(
    env.DATABASE_URL &&
      env.BETTER_AUTH_SECRET &&
      env.BETTER_AUTH_URL &&
      env.CORS_ORIGIN,
  );
}

app.use(logger());
app.use(
  "/*",
  cors({
    origin: (origin) => {
      const configuredOrigin = env.CORS_ORIGIN || undefined;
      if (!configuredOrigin) {
        return origin ?? "*";
      }
      if (!origin) return configuredOrigin;
      if (origin === configuredOrigin) return origin;
      if (env.NODE_ENV !== "production") {
        // Allow local dev hosts/ports without forcing a single frontend port.
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return origin;
        }
      }
      return configuredOrigin;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  if (!isAuthConfigured()) {
    return c.json(
      {
        error:
          "Auth is not configured. Set DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, and CORS_ORIGIN.",
      },
      503,
    );
  }

  const { auth } = await import("@image-gen/auth");
  return auth.handler(c.req.raw);
});

app.post("/api/image/prompt", async (c) => {
	try {
		const body = await c.req.json();
		const input = promptRequestSchema.parse(body);
		const payload = buildPromptPayload(input);

		return c.json(payload, 200);
	} catch (error) {
		if (error instanceof ZodError) {
			return c.json(
				{
					error: "Invalid request payload",
					details: error.flatten(),
				},
				400,
			);
		}

		return c.json(
			{
				error: "Failed to build image prompt payload",
			},
			500,
		);
	}
});

const generateImageRequestSchema = z.object({
	request: promptRequestSchema,
	openrouter: z
		.object({
			image_size: z.enum(allowedImageSizes).optional(),
		})
		.optional(),
});

app.post("/api/image/generate", async (c) => {
	if (!assertOpenRouterConfigured()) {
		return c.json(
			{
				error: "OpenRouter is not configured on the server",
			},
			503,
		);
	}

	try {
		const body = await c.req.json();
		const input = generateImageRequestSchema.parse(body);
		const promptPayload = buildPromptPayload(input.request);
		const generationResult = await generateWithOpenRouter({
			promptPayload,
			image_size: input.openrouter?.image_size,
		});

		return c.json(
			{
				prompt: promptPayload.prompt,
				meta: {
					...promptPayload.meta,
					openrouter_model: generationResult.model,
				},
				generation_task: promptPayload.generation_task,
				result: generationResult,
			},
			200,
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return c.json(
				{
					error: "Invalid request payload",
					details: error.flatten(),
				},
				400,
			);
		}

		return c.json(
			{
				error: error instanceof Error ? error.message : "Image generation failed",
			},
			500,
		);
	}
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
