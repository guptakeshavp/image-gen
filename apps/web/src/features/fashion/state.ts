import type { GeneratorState, PresetSelections } from "./types";

export const presetOptions = {
	garmentTypes: ["Dress", "Blazer", "Shirt", "Kurta", "Lehenga", "Skirt", "Jacket"],
	fitStyles: ["Regular fit", "Tailored fit", "Slim fit", "Relaxed fit", "Oversized"],
	genders: ["Female", "Male", "Unisex"],
	ageRanges: ["18-24", "25-34", "35-44", "45-60"],
	bodyTypes: ["Slim", "Athletic", "Curvy", "Plus size"],
	ethnicities: ["Indian", "South Asian", "East Asian", "Black", "White", "Latina", "Middle Eastern"],
	locationSettings: [
		"Minimal studio backdrop",
		"Luxury boutique interior",
		"Urban street setting",
		"Natural outdoor garden",
	],
	poses: [
		"Confident standing pose",
		"Walking motion",
		"3/4 turn with side glance",
		"Seated editorial pose",
	],
	photographyStyles: [
		"Commercial e-commerce clean light",
		"Editorial fashion lighting",
		"Soft natural daylight",
		"High-contrast studio",
	],
	cameraAngles: ["Full body front", "3/4 body", "Waist-up", "Close-up detail"],
	branding: ["No visible branding", "Minimal luxury branding", "Streetwear branding"],
} as const;

export const defaultSelections: PresetSelections = {
	garment_type: "Dress",
	fit_style: "Tailored fit",
	gender: "Female",
	age_range: "25-34",
	body_type: "Athletic",
	ethnicity: "Indian",
	location_setting: "Minimal studio backdrop",
	pose: "Confident standing pose",
	photography_style: "Commercial e-commerce clean light",
	camera_angle: "Full body front",
	branding: "No visible branding",
};

export const defaultGeneratorState: GeneratorState = {
	generation_task: "new",
	selected_options: defaultSelections,
	uploaded_fabric: null,
	edit_instruction: "",
	variation_focus: "pose",
	variation_count: 4,
	edit_source_image: null,
};
