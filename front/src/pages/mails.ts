import "../utils/requireLogin";
import { checkTokenRefresh } from "../utils/tokenRefresh";
import "./mails.scss";
import { displayFiles, initShow } from "./modules/displayFiles";
import { getMailDateElement } from "./modules/mailDate";

checkTokenRefresh();
const mailsContainer = qs(".mails-container");

async function main() {
    const res = await fetch("/api/files/mails").then(res => res.json());
    if (res.err) {
        mailsContainer.innerHTML = `<p class="error-message">${res.msg}</p>`;
        return
    }
    if (res.length === 0) {
        mailsContainer.innerHTML = `<p class="error-message">No mails found.</p>`;
        return;
    }
    mailsContainer.innerHTML = "<ul>" + res.map(mail => {
        return `
            <li>
                <h3>${mail.name}</h3>
                ${getMailDateElement(mail._id)}
                <button class="show" data-id="${mail.name}">View Files</button>
                <div class="files-container" data-id="files-${mail.name}"></div>
            </li>
        `
    }).join("") + "</ul>";

    res.forEach(mail => {
        displayFiles({
            name: mail.name,
            files: mail.files,
            apiPath: "/api/files",
            containerId: `files-${mail.name}`
        });
    });
    initShow(mailsContainer);
}

try {
    main();
} catch (error) {
    console.error("Failed to load mails:", error);
    mailsContainer.innerHTML = `<p class="error-message">Could not connect to the server.</p>`;
}