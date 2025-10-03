
import { popupSupported } from "./extensions";
import { getIconForFile } from "./fileUtils";
import { openFilePopup } from "./popup";

interface DisplayFilesParams {
    name: string;
    files: string[];
    apiPath: string;
    containerId: string;
    user?: string;
}

export function displayFiles({ name, files, apiPath, containerId, user }: DisplayFilesParams) {
    const container = qs(containerId, 1);
    if (!container) return console.error(`Container ${containerId} not found`);

    if (!files || files.length === 0) {
        container.innerHTML = `<p>${t("No files in this mail")}.</p>`;
        return;
    }

    let html = "<ul>";
    files.forEach(file => {
        const urlParams = new URLSearchParams();
        urlParams.set("name", name);
        urlParams.set("file", file);
        if (user) urlParams.set("user", user);

        const fileUrl = `${apiPath}?${urlParams.toString()}`;
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

export function initShow(container: HTMLDivElement) {
    container.addEventListener("click", (event) => {
        const target = event.target as HTMLButtonElement;
        if (target.classList.contains("show")) {
            const container = qs(`files-${target.dataset.id}`, 1);
            if (!container) return;
            container.style.display = container.style.display === "block" ? "" : "block";
        }
    });
}