export type GenerationTask = "new" | "edit" | "variation";

export type VariationFocus = "color" | "pose" | "camera_angle" | "background" | "model";

export type PresetSelections = {
	garment_type: string;
	fit_style: string;
	gender: string;
	age_range: string;
	body_type: string;
	ethnicity: string;
	location_setting: string;
	pose: string;
	photography_style: string;
	camera_angle: string;
	branding: string;
};

export type UploadedFabric = {
	name: string;
	mimeType: string;
	sizeBytes: number;
	dataUrl: string;
};

export type GeneratorState = {
	generation_task: GenerationTask;
	selected_options: PresetSelections;
	uploaded_fabric: UploadedFabric | null;
	edit_instruction: string;
	variation_focus: VariationFocus;
	variation_count: number;
	edit_source_image: string | null;
};

export type PromptPayload = {
	prompt: string;
	meta: {
		model?: string;
		generation_task: GenerationTask;
		selected_options: PresetSelections;
		uploaded_image_reference: string;
		settings?: {
			edit_instruction?: string;
			variation_focus?: VariationFocus;
			variation_count?: number;
		};
		openrouter_model?: string;
	};
	generation_task: GenerationTask;
};

export type GenerationHistoryItem = {
	id: string;
	createdAt: string;
	request: GeneratorState;
	promptPayload: PromptPayload;
	images: string[];
	text: string | null;
};
