import * as extensions from "./extensions";

export function getIconForFile(filename: string): string {
	const extension = filename.split(".").pop()?.toLowerCase() || "";

	if (extensions.image.includes(extension)) return "🖼️";
	if (extensions.video.includes(extension)) return "🎬";
	if (extensions.audio.includes(extension)) return "🎵";
	if (extensions.textCode.includes(extension)) return "📝";
	if (extensions.doc.includes(extension)) return "📄";
	if (extensions.sheet.includes(extension)) return "📊";
	if (extensions.archive.includes(extension)) return "📦";

	return "📁";
}
