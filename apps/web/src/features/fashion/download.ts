export async function downloadImageFromUrl(url: string, filename: string) {
	try {
		const response = await fetch(url, { mode: "cors" });
		if (!response.ok) {
			throw new Error(`Failed to fetch image (${response.status})`);
		}

		const blob = await response.blob();
		const objectUrl = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = objectUrl;
		link.download = filename;
		link.rel = "noopener";
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(objectUrl);
		return true;
	} catch {
		// Fallback for providers that disallow CORS/blob download.
		const link = document.createElement("a");
		link.href = url;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		document.body.appendChild(link);
		link.click();
		link.remove();
		return false;
	}
}
