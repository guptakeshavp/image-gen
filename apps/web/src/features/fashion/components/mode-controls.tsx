import { Label } from "@/components/ui/label";

import type { GenerationTask, VariationFocus } from "../types";

type ModeControlsProps = {
	task: GenerationTask;
	editInstruction: string;
	variationFocus: VariationFocus;
	variationCount: number;
	editSourceImage: string | null;
	onTaskChange: (task: GenerationTask) => void;
	onEditInstructionChange: (value: string) => void;
	onVariationFocusChange: (value: VariationFocus) => void;
	onVariationCountChange: (value: number) => void;
};

const variationFocusOptions: VariationFocus[] = [
	"color",
	"pose",
	"camera_angle",
	"background",
	"model",
];

export default function ModeControls({
	task,
	editInstruction,
	variationFocus,
	variationCount,
	editSourceImage,
	onTaskChange,
	onEditInstructionChange,
	onVariationFocusChange,
	onVariationCountChange,
}: ModeControlsProps) {
	return (
		<section className="rounded-xl border p-4">
			<h3 className="text-lg font-semibold">3. Edit & Variation Mode</h3>
			<p className="text-sm text-muted-foreground">
				Choose whether to create a new output, edit an existing result, or generate variations.
			</p>

			<div className="mt-3 grid gap-3 md:grid-cols-3">
				{(["new", "edit", "variation"] as const).map((mode) => (
					<button
						type="button"
						key={mode}
						className={`rounded-md border px-3 py-2 text-sm capitalize ${task === mode ? "bg-primary text-primary-foreground" : ""}`}
						onClick={() => onTaskChange(mode)}
					>
						{mode}
					</button>
				))}
			</div>

			{task === "edit" ? (
				<div className="mt-4 space-y-2">
					<Label htmlFor="edit-instruction">Edit Instruction</Label>
					<textarea
						id="edit-instruction"
						className="bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
						placeholder="Example: keep same garment, switch to warmer studio lighting and a walking pose."
						value={editInstruction}
						onChange={(event) => onEditInstructionChange(event.target.value)}
					/>
					<p className="text-xs text-muted-foreground">
						Edit source image: {editSourceImage ? "Selected from history" : "Not selected"}
					</p>
				</div>
			) : null}

			{task === "variation" ? (
				<div className="mt-4 grid gap-3 md:grid-cols-2">
					<div className="space-y-1.5">
						<Label>Variation Focus</Label>
						<select
							value={variationFocus}
							className="bg-background w-full rounded-md border px-3 py-2 text-sm"
							onChange={(event) => onVariationFocusChange(event.target.value as VariationFocus)}
						>
							{variationFocusOptions.map((focus) => (
								<option key={focus} value={focus}>
									{focus}
								</option>
							))}
						</select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="variation-count">Variation Count</Label>
						<input
							id="variation-count"
							type="number"
							min={2}
							max={8}
							value={variationCount}
							className="bg-background w-full rounded-md border px-3 py-2 text-sm"
							onChange={(event) => onVariationCountChange(Number(event.target.value))}
						/>
					</div>
				</div>
			) : null}
		</section>
	);
}
