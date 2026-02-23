import { Button } from "@/components/ui/button";

import type { GenerationHistoryItem } from "../types";

type ImageHistoryGalleryProps = {
	items: GenerationHistoryItem[];
	onUseForEdit: (url: string) => void;
};

export default function ImageHistoryGallery({ items, onUseForEdit }: ImageHistoryGalleryProps) {
	if (items.length === 0) {
		return (
			<section className="rounded-xl border p-4">
				<h3 className="text-lg font-semibold">6. Image History Gallery</h3>
				<p className="text-sm text-muted-foreground">No generated images yet.</p>
			</section>
		);
	}

	return (
		<section className="rounded-xl border p-4">
			<h3 className="text-lg font-semibold">6. Image History Gallery</h3>
			<div className="mt-3 grid gap-4 md:grid-cols-2">
				{items.map((item) => (
					<article key={item.id} className="rounded-lg border p-3">
						<p className="text-xs text-muted-foreground">
							{new Date(item.createdAt).toLocaleString()}
						</p>
						<p className="text-sm font-medium capitalize">Task: {item.request.generation_task}</p>
						<p className="line-clamp-3 text-xs text-muted-foreground">{item.promptPayload.prompt}</p>
						<div className="mt-2 grid grid-cols-2 gap-2">
							{item.images.map((imageUrl) => (
								<img
									key={imageUrl}
									src={imageUrl}
									alt="Generated fashion result"
									className="h-36 w-full rounded-md border object-cover"
								/>
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
