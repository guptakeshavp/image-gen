import { Label } from "@/components/ui/label";

import { presetOptions } from "../state";
import type { PresetSelections } from "../types";

type PresetSelectionProps = {
	value: PresetSelections;
	onChange: (next: PresetSelections) => void;
};

type SelectFieldProps = {
	label: string;
	value: string;
	options: readonly string[];
	onChange: (value: string) => void;
};

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			<select
				className="bg-background w-full rounded-md border px-3 py-2 text-sm"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}

export default function PresetSelection({ value, onChange }: PresetSelectionProps) {
	return (
		<section className="rounded-xl border p-4">
			<h3 className="text-lg font-semibold">2. Preset Selection</h3>
			<p className="text-sm text-muted-foreground">
				Select garment, model, scene, and photography attributes.
			</p>
			<div className="mt-3 grid gap-3 md:grid-cols-2">
				<SelectField
					label="Garment Type"
					value={value.garment_type}
					options={presetOptions.garmentTypes}
					onChange={(garment_type) => onChange({ ...value, garment_type })}
				/>
				<SelectField
					label="Fit Style"
					value={value.fit_style}
					options={presetOptions.fitStyles}
					onChange={(fit_style) => onChange({ ...value, fit_style })}
				/>
				<SelectField
					label="Gender"
					value={value.gender}
					options={presetOptions.genders}
					onChange={(gender) => onChange({ ...value, gender })}
				/>
				<SelectField
					label="Age Range"
					value={value.age_range}
					options={presetOptions.ageRanges}
					onChange={(age_range) => onChange({ ...value, age_range })}
				/>
				<SelectField
					label="Body Type"
					value={value.body_type}
					options={presetOptions.bodyTypes}
					onChange={(body_type) => onChange({ ...value, body_type })}
				/>
				<SelectField
					label="Ethnicity"
					value={value.ethnicity}
					options={presetOptions.ethnicities}
					onChange={(ethnicity) => onChange({ ...value, ethnicity })}
				/>
				<SelectField
					label="Location"
					value={value.location_setting}
					options={presetOptions.locationSettings}
					onChange={(location_setting) => onChange({ ...value, location_setting })}
				/>
				<SelectField
					label="Pose"
					value={value.pose}
					options={presetOptions.poses}
					onChange={(pose) => onChange({ ...value, pose })}
				/>
				<SelectField
					label="Photography Style"
					value={value.photography_style}
					options={presetOptions.photographyStyles}
					onChange={(photography_style) => onChange({ ...value, photography_style })}
				/>
				<SelectField
					label="Camera Angle"
					value={value.camera_angle}
					options={presetOptions.cameraAngles}
					onChange={(camera_angle) => onChange({ ...value, camera_angle })}
				/>
				<SelectField
					label="Branding"
					value={value.branding}
					options={presetOptions.branding}
					onChange={(branding) => onChange({ ...value, branding })}
				/>
			</div>
		</section>
	);
}
