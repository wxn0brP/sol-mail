import "./mails.scss";
import "../utils/requireLogin";
const mailsContainer = qs("#mails-container");

async function loadMails() {
    const res = await fetch("/api/files").then(res => res.json());
    if (res.err) {
        mailsContainer.innerHTML = `<p class="error-message">${res.msg}</p>`;
    } else {
        displayMails(res.mails);
    }
}

function displayMails(mails: string[]) {
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
            const mailName = (event.target as HTMLElement).dataset.mail;
            loadFiles(mailName);
        });
    });
}

async function loadFiles(mailName: string) {
    const res = await fetch(`/api/files/${encodeURIComponent(mailName)}`).then(res => res.json());
    if (res.err) {
        qs(`#files-${mailName}`).innerHTML = `<p class="error-message">${res.msg}</p>`;
    } else {
        displayFiles(mailName, res.files);
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
        html += `
            <li>
                <a href="/api/files/${encodeURIComponent(mailName)}/${encodeURIComponent(file)}" target="_blank">${file}</a>
            </li>
        `;
    });
    html += "</ul>";

    container.innerHTML = html;
}

loadMails();