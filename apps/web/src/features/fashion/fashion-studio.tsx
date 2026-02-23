import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { generateFashionImage } from "./api";
import FabricUpload from "./components/fabric-upload";
import ImageHistoryGallery from "./components/image-history-gallery";
import ModeControls from "./components/mode-controls";
import PresetSelection from "./components/preset-selection";
import { downloadImageFromUrl } from "./download";
import { defaultGeneratorState } from "./state";
import type { GenerationHistoryItem, GeneratorState } from "./types";

export default function FashionStudio() {
	const [state, setState] = useState<GeneratorState>(defaultGeneratorState);
	const [isGenerating, setIsGenerating] = useState(false);
	const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
	const [latestImages, setLatestImages] = useState<string[]>([]);
	const [lastError, setLastError] = useState<string | null>(null);

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

	async function handleDownloadLatestImage(imageUrl: string, index: number) {
		const timestamp = new Date().toISOString().replaceAll(":", "-");
		const didDirectDownload = await downloadImageFromUrl(
			imageUrl,
			`fashion-latest-${index + 1}-${timestamp}.png`,
		);
		if (didDirectDownload) {
			toast.success("Image downloaded");
			return;
		}
		toast.info("Opened image in a new tab. Save from browser if auto-download is blocked.");
	}

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
			<section className="from-amber-50 to-sky-50/70 rounded-2xl border border-amber-200/70 bg-gradient-to-br p-6 shadow-sm">
				<h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Fashion Image Generation Tool</h1>
				<p className="mt-2 text-sm text-slate-600">
					Structured fashion prompt workflow using OpenRouter model configured in server{" "}
					<code>.env</code>.
				</p>
				<div className="mt-4 rounded-xl border border-amber-200 bg-white/85 p-4 text-sm shadow-sm">
					<p className="font-semibold text-slate-900">How to submit</p>
					<p className="mt-1 text-slate-600">
						1) Upload fabric image, 2) choose presets, 3) click <strong>Generate Images</strong>.
						Selected options are submitted automatically.
					</p>
				</div>
				{lastError ? (
					<div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
						{lastError}
					</div>
				) : null}
			</section>

			<div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
				<div className="space-y-6">
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
					<section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-900">4. Generate</h3>
						<p className="mt-2 text-sm text-slate-600">
							When ready, generate images using your selected options.
						</p>
						<Button
							type="button"
							className="mt-4 w-full"
							onClick={handleGenerate}
							disabled={isGenerating || !state.uploaded_fabric}
						>
							{isGenerating ? "Generating..." : "5. Generate Images"}
						</Button>
						{!state.uploaded_fabric ? (
							<p className="mt-2 text-xs text-slate-500">
								Upload a fabric image to enable generation.
							</p>
						) : null}
					</section>
				</div>

				<div className="space-y-6">
					<section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-900">Latest Output</h3>
						{isGenerating ? (
							<div className="mt-3 grid grid-cols-2 gap-3">
								<div className="h-40 animate-pulse rounded-lg bg-slate-100" />
								<div className="h-40 animate-pulse rounded-lg bg-slate-100" />
							</div>
						) : latestImages.length > 0 ? (
							<div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
								{latestImages.map((imageUrl, index) => (
									<div key={imageUrl} className="space-y-2">
										<img
											src={imageUrl}
											alt="Latest generated fashion image"
											className="h-48 w-full rounded-lg border border-slate-200 object-cover shadow-sm"
										/>
										<Button
											type="button"
											size="sm"
											variant="outline"
											className="w-full"
											onClick={() => void handleDownloadLatestImage(imageUrl, index)}
										>
											Download
										</Button>
									</div>
								))}
							</div>
						) : (
							<p className="mt-2 text-sm text-slate-500">
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
