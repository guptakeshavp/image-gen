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
		<section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
			<h3 className="text-lg font-semibold text-slate-900">3. Edit & Variation Mode</h3>
			<p className="text-sm text-slate-600">
				Choose whether to create a new output, edit an existing result, or generate variations.
			</p>

			<div className="mt-3 grid gap-3 md:grid-cols-3">
				{(["new", "edit", "variation"] as const).map((mode) => (
					<button
						type="button"
						key={mode}
						className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${task === mode ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
						onClick={() => onTaskChange(mode)}
					>
						{mode}
					</button>
				))}
			</div>

			{task === "edit" ? (
				<div className="mt-4 space-y-2">
					<Label htmlFor="edit-instruction" className="text-slate-700">
						Edit Instruction
					</Label>
					<textarea
						id="edit-instruction"
						className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400"
						placeholder="Example: keep same garment, switch to warmer studio lighting and a walking pose."
						value={editInstruction}
						onChange={(event) => onEditInstructionChange(event.target.value)}
					/>
					<p className="text-xs text-slate-500">
						Edit source image: {editSourceImage ? "Selected from history" : "Not selected"}
					</p>
				</div>
			) : null}

			{task === "variation" ? (
				<div className="mt-4 grid gap-3 md:grid-cols-2">
					<div className="space-y-1.5">
						<Label className="text-slate-700">Variation Focus</Label>
						<select
							value={variationFocus}
							className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400"
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
						<Label htmlFor="variation-count" className="text-slate-700">
							Variation Count
						</Label>
						<input
							id="variation-count"
							type="number"
							min={2}
							max={8}
							value={variationCount}
							className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-slate-400"
							onChange={(event) => onVariationCountChange(Number(event.target.value))}
						/>
					</div>
				</div>
			) : null}
		</section>
	);
}
