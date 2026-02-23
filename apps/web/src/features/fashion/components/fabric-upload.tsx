import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { UploadedFabric } from "../types";

type FabricUploadProps = {
	fabric: UploadedFabric | null;
	onUpload: (fabric: UploadedFabric) => void;
};

async function fileToDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}

export default function FabricUpload({ fabric, onUpload }: FabricUploadProps) {
	return (
		<section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
			<h3 className="text-lg font-semibold text-slate-900">1. Fabric Upload</h3>
			<p className="text-sm text-slate-600">
				Upload the fabric/design image that will define texture, print, and color fidelity.
			</p>
			<div className="mt-3 space-y-2">
				<Label htmlFor="fabric-upload" className="text-slate-700">
					Fabric Image
				</Label>
				<Input
					id="fabric-upload"
					type="file"
					accept="image/*"
					onChange={async (event) => {
						const selectedFile = event.target.files?.[0];
						if (!selectedFile) return;
						const dataUrl = await fileToDataUrl(selectedFile);
						onUpload({
							name: selectedFile.name,
							mimeType: selectedFile.type,
							sizeBytes: selectedFile.size,
							dataUrl,
						});
					}}
				/>
			</div>
			{fabric ? (
				<div className="mt-4 space-y-2">
					<p className="text-sm text-slate-600">
						{fabric.name} ({Math.ceil(fabric.sizeBytes / 1024)} KB)
					</p>
					<img
						src={fabric.dataUrl}
						alt="Uploaded fabric preview"
						className="h-48 w-full rounded-lg border border-slate-200 object-cover shadow-sm"
					/>
				</div>
			) : null}
		</section>
	);
}
