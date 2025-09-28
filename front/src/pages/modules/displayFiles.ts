
import { popupSupported } from "./extensions";
import { getIconForFile } from "./file-utils";
import { openFilePopup } from "./popup";

interface DisplayFilesParams {
    mailName: string;
    files: string[];
    apiPath: string;
    container: HTMLElement;
}

export function displayFiles({ mailName, files, apiPath, container }: DisplayFilesParams) {
    if (!files || files.length === 0) {
        container.innerHTML = "<p>No files in this mail.</p>";
        return;
    }

    let html = "<ul>";
    files.forEach(file => {
        const fileUrl = `${apiPath}/${encodeURIComponent(mailName)}/${encodeURIComponent(file)}`;
        const icon = getIconForFile(file);
        html += `
            <li>
                <a href="${fileUrl}" data-filename="${file}" target="_blank">
                    <span class="file-icon">${icon}</span>
                    <span class="file-name">${file}</span>
                </a>
            </li>
        `;
    });
    html += "</ul>";

    container.innerHTML = html;

    container.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", (e) => {
            const target = a as HTMLAnchorElement;
            const url = target.href;
            const filename = target.dataset.filename;
            if (!filename) return;

            const extension = filename.split(".").pop()?.toLowerCase() || "";

            if (popupSupported.includes(extension)) {
                e.preventDefault();
                openFilePopup(url, filename);
            }
        });
    });
}