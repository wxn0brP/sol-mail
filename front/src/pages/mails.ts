import { displayFiles, initShow } from "#mail/displayFiles";
import { getMailBody, getMailDateElement, sort } from "#mail/mailUtils";
import { Mail } from "#types";
import "_requireLogin";
import { checkTokenRefresh } from "_tokenRefresh";
import "./mails.scss";

checkTokenRefresh();
const mailsContainer = qs(".mails-container");
const isPublic = (new URL(window.location.href)).searchParams.get("public") === "true";
qs("#mail-type").textContent = isPublic ? t("Public") : t("Your");
qs("#mail-type").setAttribute("translate", isPublic ? "Public" : "Your");

async function main() {
    const res = await fetch("/api/files/mails" + (isPublic ? "?public=true" : "")).then(res => res.json()) as Mail[];
    // @ts-ignore
    if (res.err) {
        // @ts-ignore
        mailsContainer.innerHTML = `<p class="error-message">${t(res.msg)}</p>`;
        return
    }

    if (res.length === 0) {
        mailsContainer.innerHTML = `<p class="error-message">${t("No mails found")}.</p>`;
        return;
    }

    mailsContainer.innerHTML = "<ul>" + sort(res).map(mail => {
        return `
            <li>
                <h3>${mail.name}</h3>
                ${getMailDateElement(mail._id)}
                ${getMailBody(mail.txt)}
                <button class="show" data-id="${mail._id}">${t("View Files")}</button>
                <div class="files-container" data-id="files-${mail._id}"></div>
            </li>
        `
    }).join("") + "</ul>";

    res.forEach(mail => {
        displayFiles({
            name: mail.name,
            files: mail.files,
            apiPath: "/api/files/files",
            containerId: `files-${mail._id}`,
            user: isPublic ? "public" : undefined
        });
    });
    initShow(mailsContainer);
}

try {
    main();
} catch (error) {
    console.error("Failed to load mails:", error);
    mailsContainer.innerHTML = `<p class="error-message">${t("Could not connect to the server")}.</p>`;
}