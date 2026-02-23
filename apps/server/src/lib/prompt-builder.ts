import { env } from "@image-gen/env/server";
import { z } from "zod";

const generationTaskSchema = z.enum(["new", "edit", "variation"]);

const selectionSchema = z.object({
	garment_type: z.string().min(1),
	fit_style: z.string().min(1),
	gender: z.string().min(1),
	age_range: z.string().min(1),
	body_type: z.string().min(1),
	ethnicity: z.string().min(1),
	location_setting: z.string().min(1),
	pose: z.string().min(1),
	photography_style: z.string().min(1),
	camera_angle: z.string().min(1),
	branding: z.string().min(1).optional(),
});

const variationFocusSchema = z.enum(["color", "pose", "camera_angle", "background", "model"]);

const baseInputSchema = z.object({
	generation_task: generationTaskSchema,
	selected_options: selectionSchema,
	uploaded_image_reference: z.string().min(1),
});

const newInputSchema = baseInputSchema.extend({
	generation_task: z.literal("new"),
});

const editInputSchema = baseInputSchema.extend({
	generation_task: z.literal("edit"),
	edit_instruction: z.string().min(1),
});

const variationInputSchema = baseInputSchema.extend({
	generation_task: z.literal("variation"),
	variation_focus: variationFocusSchema,
	variation_count: z.number().int().min(2).max(8).default(4),
});

export const promptRequestSchema = z.discriminatedUnion("generation_task", [
	newInputSchema,
	editInputSchema,
	variationInputSchema,
]);

export type PromptRequest = z.infer<typeof promptRequestSchema>;

type PromptResponse = {
	prompt: string;
	meta: {
		model: string;
		generation_task: PromptRequest["generation_task"];
		selected_options: z.infer<typeof selectionSchema>;
		uploaded_image_reference: string;
		settings?: {
			edit_instruction?: string;
			variation_focus?: z.infer<typeof variationFocusSchema>;
			variation_count?: number;
		};
	};
	generation_task: PromptRequest["generation_task"];
};

function buildNewPrompt(input: z.infer<typeof newInputSchema>) {
	const options = input.selected_options;

	return [
		"Generate a high-resolution fashion photograph of a garment made from the uploaded fabric/design image.",
		`Garment: ${options.garment_type}, ${options.fit_style}`,
		`Model: ${options.gender}, ${options.age_range}, ${options.body_type}, ${options.ethnicity}`,
		`Background/Location: ${options.location_setting}`,
		`Pose: ${options.pose}`,
		`Photography Style: ${options.photography_style}`,
		`Camera Framing: ${options.camera_angle}`,
		`Branding: ${options.branding ?? "none"}`,
		"The uploaded image is the source material/design input; preserve texture, print, embroidery, color saturation, and weave pattern with high fidelity.",
		"The model should wear the generated outfit with natural lighting and professional fashion photography aesthetics.",
		"Use clean, detailed, realistic visual language suited for commercial e-commerce catalogs and marketing.",
		"No cartoon, abstract, or stylized interpretation unless explicitly requested.",
	].join("\n");
}

function buildEditPrompt(input: z.infer<typeof editInputSchema>) {
	return [
		"Take the existing generated result and apply the requested edit while preserving what should remain unchanged.",
		`Edit Instruction: ${input.edit_instruction}`,
		"Preserve fabric details from the uploaded image: texture, weave, print alignment, embroidery, and color accuracy.",
		"Preserve model characteristics and overall composition unless the edit explicitly changes pose or background.",
		"Maintain lighting realism and professional commercial fashion-photo quality.",
	].join("\n");
}

function buildVariationPrompt(input: z.infer<typeof variationInputSchema>) {
	const options = input.selected_options;

	return [
		`Create ${input.variation_count} high-resolution commercial fashion image variations of the same base garment.`,
		`Variation focus: ${input.variation_focus}`,
		`Garment: ${options.garment_type}, ${options.fit_style}`,
		`Model: ${options.gender}, ${options.age_range}, ${options.body_type}, ${options.ethnicity}`,
		`Background/Location: ${options.location_setting}`,
		`Pose: ${options.pose}`,
		`Photography Style: ${options.photography_style}`,
		`Camera Framing: ${options.camera_angle}`,
		`Branding: ${options.branding ?? "none"}`,
		"All variations must keep the same fabric fidelity from the uploaded material/design image.",
		"Keep outputs realistic, detailed, and suitable for e-commerce catalogs and marketing usage.",
	].join("\n");
}

export function buildPromptPayload(input: PromptRequest): PromptResponse {
	if (input.generation_task === "new") {
		return {
			prompt: buildNewPrompt(input),
			meta: {
				model: env.OPENROUTER_MODEL,
				generation_task: input.generation_task,
				selected_options: input.selected_options,
				uploaded_image_reference: input.uploaded_image_reference,
			},
			generation_task: input.generation_task,
		};
	}

	if (input.generation_task === "edit") {
		return {
			prompt: buildEditPrompt(input),
			meta: {
				model: env.OPENROUTER_MODEL,
				generation_task: input.generation_task,
				selected_options: input.selected_options,
				uploaded_image_reference: input.uploaded_image_reference,
				settings: {
					edit_instruction: input.edit_instruction,
				},
			},
			generation_task: input.generation_task,
		};
	}

	return {
		prompt: buildVariationPrompt(input),
		meta: {
			model: env.OPENROUTER_MODEL,
			generation_task: input.generation_task,
			selected_options: input.selected_options,
			uploaded_image_reference: input.uploaded_image_reference,
			settings: {
				variation_focus: input.variation_focus,
				variation_count: input.variation_count,
			},
		},
		generation_task: input.generation_task,
	};
}
