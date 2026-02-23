import { env } from "@image-gen/env/server";

type PromptPayload = {
	prompt: string;
	meta: {
		model: string;
		uploaded_image_reference: string;
	};
	generation_task: "new" | "edit" | "variation";
};

const imageSizeSchema = ["1024x1024", "1024x1536", "1536x1024"] as const;
type ImageSize = (typeof imageSizeSchema)[number];

type OpenRouterGenerateArgs = {
	promptPayload: PromptPayload;
	image_size?: ImageSize;
};

type OpenRouterApiResponse = {
	id?: string;
	created?: number;
	model?: string;
	choices?: Array<{
		message?: {
			content?: unknown;
			images?: Array<{
				type?: string;
				image_url?: {
					url?: string;
				};
			}>;
		};
	}>;
	error?: {
		message?: string;
	};
};

export function assertOpenRouterConfigured() {
	return Boolean(env.OPENROUTER_API_KEY);
}

function extractImageUrls(response: OpenRouterApiResponse) {
	const firstChoice = response.choices?.[0];
	const message = firstChoice?.message;
	if (!message) return [];

	const fromImages =
		message.images
			?.map((image) => image.image_url?.url)
			.filter((url): url is string => Boolean(url)) ?? [];

	if (fromImages.length > 0) {
		return fromImages;
	}

	// Some providers return content parts with image_url objects.
	if (Array.isArray(message.content)) {
		return message.content
			.flatMap((part) => {
				if (
					part &&
					typeof part === "object" &&
					"type" in part &&
					part.type === "image_url" &&
					"image_url" in part &&
					part.image_url &&
					typeof part.image_url === "object" &&
					"url" in part.image_url &&
					typeof part.image_url.url === "string"
				) {
					return [part.image_url.url];
				}
				return [];
			})
			.filter((url) => Boolean(url));
	}

	return [];
}

export async function generateWithOpenRouter({
	promptPayload,
	image_size,
}: OpenRouterGenerateArgs) {
	if (!env.OPENROUTER_API_KEY) {
		throw new Error("OPENROUTER_API_KEY is not configured");
	}

	const selectedModel = env.OPENROUTER_MODEL;
	const userContent: Array<
		| {
				type: "text";
				text: string;
		  }
		| {
				type: "image_url";
				image_url: { url: string };
		  }
	> = [
		{
			type: "text",
			text: promptPayload.prompt,
		},
		{
			type: "image_url",
			image_url: {
				url: promptPayload.meta.uploaded_image_reference,
			},
		},
	];

	const requestBody = {
		model: selectedModel,
		modalities: ["image", "text"],
		messages: [
			{
				role: "user",
				content: userContent,
			},
		],
		// Kept for compatibility where providers accept explicit image sizing.
		...(image_size ? { image_config: { size: image_size } } : {}),
	};

	const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
			"Content-Type": "application/json",
			...(env.OPENROUTER_SITE_URL ? { "HTTP-Referer": env.OPENROUTER_SITE_URL } : {}),
			...(env.OPENROUTER_SITE_NAME ? { "X-Title": env.OPENROUTER_SITE_NAME } : {}),
		},
		body: JSON.stringify(requestBody),
	});

	const rawText = await response.text();
	let data: OpenRouterApiResponse = {};
	try {
		data = JSON.parse(rawText) as OpenRouterApiResponse;
	} catch {
		// Leave as empty object and include raw body in the error path below.
	}

	if (!response.ok) {
		const message = data.error?.message ?? rawText ?? "OpenRouter request failed";
		throw new Error(`OpenRouter request failed (${response.status}): ${message}`);
	}

	const firstChoice = data.choices?.[0];
	const images = extractImageUrls(data);

	return {
		id: data.id,
		created: data.created,
		model: data.model ?? selectedModel,
		text: typeof firstChoice?.message?.content === "string" ? firstChoice.message.content : null,
		images,
	};
}

export const allowedImageSizes = imageSizeSchema;
