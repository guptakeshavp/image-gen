import type { GeneratorState, PromptPayload } from "./types";

export function resolveImageReference(state: GeneratorState) {
	if (state.generation_task === "edit" && state.edit_source_image) {
		return state.edit_source_image;
	}
	return state.uploaded_fabric?.dataUrl ?? "";
}

export function buildPromptPayload(state: GeneratorState): PromptPayload {
	const imageReference = resolveImageReference(state);
	const options = state.selected_options;

	if (state.generation_task === "edit") {
		return {
			prompt: [
				"Take the existing generated result and apply the requested edit while preserving what should remain unchanged.",
				`Edit Instruction: ${state.edit_instruction}`,
				`Garment: ${options.garment_type}, ${options.fit_style}`,
				`Model: ${options.gender}, ${options.age_range}, ${options.body_type}, ${options.ethnicity}`,
				`Background/Location: ${options.location_setting}`,
				`Pose: ${options.pose}`,
				`Photography Style: ${options.photography_style}`,
				`Camera Framing: ${options.camera_angle}`,
				`Branding: ${options.branding}`,
				"Maintain realism and commercial fashion quality suitable for e-commerce.",
			].join("\n"),
			meta: {
				generation_task: "edit",
				selected_options: options,
				uploaded_image_reference: imageReference,
				settings: {
					edit_instruction: state.edit_instruction,
				},
			},
			generation_task: "edit",
		};
	}

	if (state.generation_task === "variation") {
		return {
			prompt: [
				`Create ${state.variation_count} variations of the base image focusing on ${state.variation_focus}.`,
				`Garment: ${options.garment_type}, ${options.fit_style}`,
				`Model: ${options.gender}, ${options.age_range}, ${options.body_type}, ${options.ethnicity}`,
				`Background/Location: ${options.location_setting}`,
				`Pose: ${options.pose}`,
				`Photography Style: ${options.photography_style}`,
				`Camera Framing: ${options.camera_angle}`,
				`Branding: ${options.branding}`,
				"Keep fabric texture, color, print, and weave fidelity consistent across all variations.",
			].join("\n"),
			meta: {
				generation_task: "variation",
				selected_options: options,
				uploaded_image_reference: imageReference,
				settings: {
					variation_focus: state.variation_focus,
					variation_count: state.variation_count,
				},
			},
			generation_task: "variation",
		};
	}

	return {
		prompt: [
			"Generate a high-resolution, realistic, commercial fashion image from the uploaded fabric/design image.",
			`Garment: ${options.garment_type}, ${options.fit_style}`,
			`Model: ${options.gender}, ${options.age_range}, ${options.body_type}, ${options.ethnicity}`,
			`Background/Location: ${options.location_setting}`,
			`Pose: ${options.pose}`,
			`Photography Style: ${options.photography_style}`,
			`Camera Framing: ${options.camera_angle}`,
			`Branding: ${options.branding}`,
			"The garment must accurately preserve uploaded fabric texture, pattern, color saturation, and detail.",
			"Use natural skin tones, realistic shadows, depth of field, and e-commerce catalog quality styling.",
		].join("\n"),
		meta: {
			generation_task: "new",
			selected_options: options,
			uploaded_image_reference: imageReference,
		},
		generation_task: "new",
	};
}
