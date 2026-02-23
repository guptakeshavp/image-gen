import { Button } from "@/components/ui/button";

import { downloadImageFromUrl } from "../download";
import type { GenerationHistoryItem } from "../types";

type ImageHistoryGalleryProps = {
	items: GenerationHistoryItem[];
	onUseForEdit: (url: string) => void;
};

export default function ImageHistoryGallery({ items, onUseForEdit }: ImageHistoryGalleryProps) {
	async function handleDownloadHistoryImage(imageUrl: string, itemId: string, imageIndex: number) {
		const timestamp = new Date().toISOString().replaceAll(":", "-");
		await downloadImageFromUrl(
			imageUrl,
			`fashion-history-${itemId}-${imageIndex + 1}-${timestamp}.png`,
		);
	}

	if (items.length === 0) {
		return (
			<section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
				<h3 className="text-lg font-semibold text-slate-900">6. Image History Gallery</h3>
				<p className="text-sm text-slate-500">No generated images yet.</p>
			</section>
		);
	}

	return (
		<section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
			<h3 className="text-lg font-semibold text-slate-900">6. Image History Gallery</h3>
			<div className="mt-3 grid gap-4 md:grid-cols-2">
				{items.map((item) => (
					<article key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
						<p className="text-xs text-slate-500">
							{new Date(item.createdAt).toLocaleString()}
						</p>
						<p className="text-sm font-semibold capitalize text-slate-900">
							Task: {item.request.generation_task}
						</p>
						<p className="line-clamp-3 text-xs text-slate-500">{item.promptPayload.prompt}</p>
						<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
							{item.images.map((imageUrl, imageIndex) => (
								<div key={imageUrl} className="space-y-1.5">
									<img
										src={imageUrl}
										alt="Generated fashion result"
										className="h-36 w-full rounded-lg border border-slate-200 object-cover"
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="w-full"
										onClick={() =>
											void handleDownloadHistoryImage(imageUrl, item.id, imageIndex)
										}
									>
										Download
									</Button>
								</div>
							))}
						</div>
						{item.images[0] ? (
							<Button
								type="button"
								variant="outline"
								className="mt-3 w-full"
								onClick={() => onUseForEdit(item.images[0])}
							>
								Use First Image For Edit
							</Button>
						) : null}
					</article>
				))}
			</div>
		</section>
	);
}
