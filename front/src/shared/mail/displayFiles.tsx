import { t } from "../i18n";
import { openFilePopup } from "../ui/filePreview";
import { popupSupported } from "./extensions";
import { getIconForFile } from "./fileUtils";

export interface DisplayFilesParams {
	name: string;
	files: string[];
	apiPath: string;
	user?: string;
}

export function displayFiles({
	name,
	files,
	apiPath,
	user,
}: DisplayFilesParams) {
	if (!files || files.length === 0) {
		return <p>{t("No files in this mail")}.</p>;
	}

	return (
		<ul>
			{files.map(file => {
				const params = new URLSearchParams();
				params.set("name", name);
				if (user) params.set("user", user);

				return (
					<li>
						<a
							href={`${apiPath}/${file}?${params.toString()}`}
							data-filename={file}
							target="_blank"
							rel="noopener noreferrer">
							<span class="file-icon">{getIconForFile(file)}</span>
							<span class="file-name">{file}</span>
						</a>
					</li>
				);
			})}
		</ul>
	);
}

export function bindFileLinks(root: HTMLElement) {
	root.querySelectorAll<HTMLAnchorElement>(".files-container a").forEach(a => {
		a.addEventListener("click", e => {
			const filename = a.dataset.filename;
			if (!filename) return;

			const extension = filename.split(".").pop()?.toLowerCase() || "";

			if (popupSupported.includes(extension)) {
				e.preventDefault();
				openFilePopup(a.href, filename);
				return;
			}

			const zhiva = localStorage.getItem("zhiva");
			if (zhiva) {
				e.preventDefault();
				fetch(
					`http://localhost:${zhiva}/download?path=${encodeURIComponent(a.href)}&token=${localStorage.getItem("token")}`,
				);
			}
		});
	});
}

export function bindShowButtons(root: HTMLElement) {
	root.querySelectorAll<HTMLButtonElement>("button.show").forEach(button => {
		button.addEventListener("click", () => {
			const container = root.querySelector<HTMLElement>(
				`[data-id="files-${button.dataset.id}"]`,
			);
			const open = container?.classList.toggle("open");
			button.setAttribute("aria-expanded", String(!!open));
		});
	});
}

export function bindMailList(root: HTMLElement) {
	bindFileLinks(root);
	bindShowButtons(root);
}
