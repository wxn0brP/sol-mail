import { fetchFiles } from "./api";
import { displayFiles } from "./displayFiles";

async function loadAndDisplayFiles(mailName: string, buttonEl: HTMLButtonElement) {
    buttonEl.textContent = "Loading...";
    buttonEl.disabled = true;
    const container = qs(`files-${mailName}`, 1);

    const res = await fetchFiles(mailName);

    buttonEl.disabled = false;
    if (res.err) {
        container.innerHTML = `<p class="error-message">${res.msg}</p>`;
        buttonEl.textContent = "View Files";
    } else {
        displayFiles({
            mailName,
            files: res.files,
            apiPath: "/api/files",
            container
        });
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
                <div class="files-container" data-id="files-${mail}"></div>
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
                const container = qs(`files-${mailName}`, 1);
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
