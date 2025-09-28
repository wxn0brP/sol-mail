import "./mails.scss";
import "../utils/requireLogin";
const mailsContainer = qs("#mails-container");

const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];
const textExtensions = ["txt", "md", "json", "xml", "html", "css", "js", "ts", "log"];
const docExtensions = ["doc", "docx", "pdf"];
const sheetExtensions = ["xls", "xlsx", "csv"];
const archiveExtensions = ["zip", "rar", "7z", "tar", "gz"];
const audioExtensions = ["mp3", "wav", "ogg", "m4a"];
const videoExtensions = ["mp4", "webm", "ogv"];

async function loadMails() {
    const res = await fetch("/api/files").then(res => res.json());
    if (res.err) {
        mailsContainer.innerHTML = `<p class="error-message">${res.msg}</p>`;
    } else {
        displayMails(res.mails);
    }
}

function getIconForFile(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() || "";

    if (imageExtensions.includes(extension)) return "🖼️";
    if (videoExtensions.includes(extension)) return "🎬";
    if (audioExtensions.includes(extension)) return "🎵";
    if (textExtensions.includes(extension)) return "📝";
    if (docExtensions.includes(extension)) return "📄";
    if (sheetExtensions.includes(extension)) return "📊";
    if (archiveExtensions.includes(extension)) return "📦";

    return "📁";
}

function displayMails(mails: string[]) {
    if (!mails || mails.length === 0) {
        mailsContainer.innerHTML = "<p>You don't have any mails yet.</p>";
        return;
    }

    let html = "<ul>";
    mails.forEach(mail => {
        html += `<li>
            <h3>${mail}</h3>
            <button data-mail="${mail}">View Files</button>
            <div class="files-container" id="files-${mail}"></div>
        </li>`;
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
                    loadFiles(mailName, buttonEl);
                }
            }
        });
    });
}

async function loadFiles(mailName: string, buttonEl: HTMLButtonElement) {
    buttonEl.textContent = "Loading...";
    buttonEl.disabled = true;
    const container = qs(`#files-${mailName}`);
    const res = await fetch(`/api/files/${encodeURIComponent(mailName)}`).then(res => res.json());

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

async function openFilePopup(url: string, filename: string) {
    const existingPopup = document.querySelector(".file-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.className = "file-popup";
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h3>${filename}</h3>
                <button class="close-popup">&times;</button>
            </div>
            <div class="file-preview-container">Loading preview...</div>
        </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector(".close-popup")?.addEventListener("click", () => popup.remove());
    popup.addEventListener("click", (e) => {
        if (e.target === popup) popup.remove();
    });

    const previewContainer = popup.querySelector(".file-preview-container") as HTMLElement;
    const extension = filename.split(".").pop()?.toLowerCase() || "";

    if (imageExtensions.includes(extension)) {
        previewContainer.innerHTML = `<img src="${url}" alt="${filename}">`;
    } else if (textExtensions.includes(extension)) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
            const text = await response.text();
            const escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            previewContainer.innerHTML = `<pre>${escapedText}</pre>`;
        } catch (e) {
            console.error(e);
            previewContainer.innerHTML = `<p>Could not load file preview.</p>`;
        }
    } else if (videoExtensions.includes(extension)) {
        previewContainer.innerHTML = `<video src="${url}" controls autoplay></video>`;
    } else if (audioExtensions.includes(extension)) {
        previewContainer.innerHTML = `<audio src="${url}" controls autoplay></audio>`;
    }
}

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
        html += `<li>
            <a href="${fileUrl}" data-filename="${file}" target="_blank">
                <span class="file-icon">${icon}</span>
                <span class="file-name">${file}</span>
            </a>
        </li>`;
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

            if ([...imageExtensions, ...textExtensions, ...audioExtensions, ...videoExtensions].includes(extension)) {
                e.preventDefault();
                openFilePopup(url, filename);
            }
        });
    });
}

loadMails();