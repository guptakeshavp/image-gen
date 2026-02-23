import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { generateFashionImage } from "./api";
import FabricUpload from "./components/fabric-upload";
import ImageHistoryGallery from "./components/image-history-gallery";
import ModeControls from "./components/mode-controls";
import PresetSelection from "./components/preset-selection";
import { buildPromptPayload } from "./prompt-builder";
import { defaultGeneratorState } from "./state";
import type { GenerationHistoryItem, GeneratorState } from "./types";

export default function FashionStudio() {
	const [state, setState] = useState<GeneratorState>(defaultGeneratorState);
	const [isGenerating, setIsGenerating] = useState(false);
	const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
	const [latestImages, setLatestImages] = useState<string[]>([]);
	const [lastError, setLastError] = useState<string | null>(null);
	const [showPromptPreview, setShowPromptPreview] = useState(false);

	const promptPreview = useMemo(() => buildPromptPayload(state), [state]);

	async function handleGenerate() {
		try {
			setIsGenerating(true);
			setLastError(null);
			const response = await generateFashionImage(state);
			const item: GenerationHistoryItem = {
				id: response.result.id ?? crypto.randomUUID(),
				createdAt: new Date().toISOString(),
				request: state,
				promptPayload: {
					prompt: response.prompt,
					meta: response.meta,
					generation_task: response.generation_task,
				},
				images: response.result.images,
				text: response.result.text,
			};
			setLatestImages(response.result.images);
			setHistory((prev) => [item, ...prev]);
			toast.success("Image generation complete");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Image generation failed";
			setLastError(message);
			toast.error(message);
		} finally {
			setIsGenerating(false);
		}
	}

	return (
		<div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-4">
			<section className="rounded-xl border p-4">
				<h1 className="text-2xl font-bold">Fashion Image Generation Tool</h1>
				<p className="text-sm text-muted-foreground">
					Structured fashion prompt workflow using OpenRouter model configured in server{" "}
					<code>.env</code>.
				</p>
				<div className="mt-3 rounded-md border p-3 text-sm">
					<p className="font-medium">How to submit</p>
					<p className="text-muted-foreground">
						1) Upload fabric image, 2) choose presets, 3) click <strong>Generate Images</strong>.
						Selected options are submitted automatically.
					</p>
				</div>
				{lastError ? (
					<div className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
						{lastError}
					</div>
				) : null}
			</section>

			<div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
				<div className="space-y-5">
					<FabricUpload
						fabric={state.uploaded_fabric}
						onUpload={(uploaded_fabric) => setState((prev) => ({ ...prev, uploaded_fabric }))}
					/>
					<PresetSelection
						value={state.selected_options}
						onChange={(selected_options) => setState((prev) => ({ ...prev, selected_options }))}
					/>
					<ModeControls
						task={state.generation_task}
						editInstruction={state.edit_instruction}
						variationFocus={state.variation_focus}
						variationCount={state.variation_count}
						editSourceImage={state.edit_source_image}
						onTaskChange={(generation_task) => setState((prev) => ({ ...prev, generation_task }))}
						onEditInstructionChange={(edit_instruction) =>
							setState((prev) => ({ ...prev, edit_instruction }))
						}
						onVariationFocusChange={(variation_focus) =>
							setState((prev) => ({ ...prev, variation_focus }))
						}
						onVariationCountChange={(variation_count) =>
							setState((prev) => ({
								...prev,
								variation_count: Number.isNaN(variation_count)
									? prev.variation_count
									: Math.max(2, Math.min(8, variation_count)),
							}))
						}
					/>
					<section className="rounded-xl border p-4">
						<div className="flex items-center justify-between gap-3">
							<h3 className="text-lg font-semibold">4. Prompt Builder</h3>
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowPromptPreview((prev) => !prev)}
							>
								{showPromptPreview ? "Hide Prompt JSON" : "Show Prompt JSON"}
							</Button>
						</div>
						<p className="mt-2 text-sm text-muted-foreground">
							This converts your selected options into a structured AI prompt payload.
						</p>
						{showPromptPreview ? (
							<pre className="bg-muted mt-3 overflow-auto rounded-md p-3 text-xs">
								{JSON.stringify(promptPreview, null, 2)}
							</pre>
						) : null}
						<Button
							type="button"
							className="mt-4 w-full"
							onClick={handleGenerate}
							disabled={isGenerating || !state.uploaded_fabric}
						>
							{isGenerating ? "Generating..." : "5. Generate Images"}
						</Button>
						{!state.uploaded_fabric ? (
							<p className="mt-2 text-xs text-muted-foreground">
								Upload a fabric image to enable generation.
							</p>
						) : null}
					</section>
				</div>

				<div className="space-y-5">
					<section className="rounded-xl border p-4">
						<h3 className="text-lg font-semibold">Latest Output</h3>
						{isGenerating ? (
							<div className="mt-3 grid grid-cols-2 gap-3">
								<div className="bg-muted h-40 animate-pulse rounded-md" />
								<div className="bg-muted h-40 animate-pulse rounded-md" />
							</div>
						) : latestImages.length > 0 ? (
							<div className="mt-3 grid grid-cols-2 gap-3">
								{latestImages.map((imageUrl) => (
									<img
										key={imageUrl}
										src={imageUrl}
										alt="Latest generated fashion image"
										className="h-48 w-full rounded-md border object-cover"
									/>
								))}
							</div>
						) : (
							<p className="mt-2 text-sm text-muted-foreground">
								Generate an image to see the latest output.
							</p>
						)}
					</section>

					<ImageHistoryGallery
						items={history}
						onUseForEdit={(url) => {
							setState((prev) => ({
								...prev,
								generation_task: "edit",
								edit_source_image: url,
							}));
							toast.success("Selected history image for edit mode");
						}}
					/>
				</div>
			</div>
		</div>
	);
}
