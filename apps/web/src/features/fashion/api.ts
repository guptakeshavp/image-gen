import { env } from "@image-gen/env/web";

import { resolveImageReference } from "./prompt-builder";
import type { GeneratorState, PromptPayload } from "./types";

type ServerResponse = {
	prompt: string;
	meta: PromptPayload["meta"];
	generation_task: PromptPayload["generation_task"];
	result: {
		id?: string;
		created?: number;
		model?: string;
		text: string | null;
		images: string[];
	};
};

export async function generateFashionImage(state: GeneratorState) {
	const uploadedImageReference = resolveImageReference(state);
	if (!uploadedImageReference) {
		throw new Error("Upload a fabric image (or pick a history image for edit mode) before generating.");
	}

	const request: Record<string, unknown> = {
		generation_task: state.generation_task,
		selected_options: state.selected_options,
		uploaded_image_reference: uploadedImageReference,
	};

	if (state.generation_task === "edit") {
		request.edit_instruction = state.edit_instruction;
	}

	if (state.generation_task === "variation") {
		request.variation_focus = state.variation_focus;
		request.variation_count = state.variation_count;
	}

	let response: Response;
	try {
		response = await fetch(`${env.VITE_SERVER_URL}/api/image/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				request,
				openrouter: {
					image_size: "1024x1536",
				},
			}),
		});
	} catch {
		throw new Error(
			`Could not reach server at ${env.VITE_SERVER_URL}. Start server on port 3000 and verify VITE_SERVER_URL.`,
		);
	}

	const data = (await response.json()) as ServerResponse | { error?: string };
	if (!response.ok) {
		if ("error" in data && data.error) {
			throw new Error(data.error);
		}
		throw new Error("Image generation failed");
	}

	return data as ServerResponse;
}
