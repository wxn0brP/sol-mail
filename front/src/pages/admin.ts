import "../utils/requireLogin";
import { checkTokenRefresh } from "../utils/tokenRefresh";
import "./admin.scss";
import { displayFiles, initShow } from "./modules/displayFiles";
import { getMailBody, getMailDateElement, sort } from "./modules/mailUtils";
import { search, searchInput } from "./modules/search";
import { Mail } from "./modules/types";
import "./modules/software";
import "./modules/sse";

checkTokenRefresh();
export const app = qs("#app");

interface User {
    name: string;
    mails: Mail[];
}

const data = await fetch("/api/admin/user-data").then(res => res.json()) as User[];

if (data) {
    app.innerHTML = data.sort((a, b) => b.name.localeCompare(a.name)).map(user => {
        const mails = sort(user.mails).map(mail => {
            return `
                <li>
                    <h3>${mail.name}</h3>
                    ${getMailDateElement(mail._id)}
                    ${getMailBody(mail.txt)}
                    <button class="show" data-id="${mail._id}">${t("View Files")}</button>
                    <div class="files-container" data-id="files-${mail._id}"></div>
                </li>
            `
        }).join("");

        const r = `
            <details class="user" data-id="user-details-${user.name}">
                <summary>${user.name}</summary>
                <div class="mails-container">
                    <ul>
                        ${mails}
                    </ul>
                </div>
            </details>
        `
        return r;
    }).join("");

    data.forEach(user => {
        user.mails.forEach(mail => {
            displayFiles({
                name: mail.name,
                files: mail.files,
                apiPath: "/api/admin/files",
                user: user.name,
                containerId: `files-${mail._id}`
            });
        });
    });

    initShow(app);
    setTimeout(() => {
        if (searchInput.value) search();
    }, 10);
} else {
    app.innerHTML = `<p class="error-message">${t("Could not connect to the server")}.</p>`;
}