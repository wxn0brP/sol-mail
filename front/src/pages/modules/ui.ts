import { fetchFiles } from "./api";
import { popupSupported } from "./extensions";
import { getIconForFile } from "./file-utils";
import { openFilePopup } from "./popup";

function displayFiles(mailName: string, files: string[]) {
    const container = qs(`#files-${mailName}`);

    if (!files || files.length === 0) {
        container.innerHTML = "<p>No files in this mail.</p>";
        return;
    }

    let html = "<ul>";
    files.forEach(file => {
        const fileUrl = `/api/files/${encodeURIComponent(mailName)}/${encodeURIComponent(file)}`;
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

async function loadAndDisplayFiles(mailName: string, buttonEl: HTMLButtonElement) {
    buttonEl.textContent = "Loading...";
    buttonEl.disabled = true;
    const container = qs(`#files-${mailName}`);

    const res = await fetchFiles(mailName);

    buttonEl.disabled = false;
    if (res.err) {
        container.innerHTML = `<p class="error-message">${res.msg}</p>`;
        buttonEl.textContent = "View Files";
    } else {
        displayFiles(mailName, res.files);
        container.classList.add("loaded");
        container.style.display = "block";
        buttonEl.textContent = "Hide Files";
    }
}

export function displayMails(mails: string[], mailsContainer: HTMLElement) {
    if (!mails || mails.length === 0) {
        mailsContainer.innerHTML = "<p>You don't have any mails yet.</p>";
        return;
    }

    let html = "<ul>";
    mails.forEach(mail => {
        html += `
            <li>
                <h3>${mail}</h3>
                <button data-mail="${mail}">View Files</button>
                <div class="files-container" id="files-${mail}"></div>
            </li>
        `;
    });
    html += "</ul>";

    mailsContainer.innerHTML = html;

    document.querySelectorAll("button[data-mail]").forEach(button => {
        button.addEventListener("click", (event) => {
            const buttonEl = event.target as HTMLButtonElement;
            const mailName = buttonEl.dataset.mail;

            if (mailName) {
                const container = qs(`#files-${mailName}`);
                if (container.classList.contains("loaded")) {
                    const isHidden = container.style.display === "none";
                    container.style.display = isHidden ? "block" : "none";
                    buttonEl.textContent = isHidden ? "Hide Files" : "View Files";
                } else {
                    loadAndDisplayFiles(mailName, buttonEl);
                }
            }
        });
    });
}
