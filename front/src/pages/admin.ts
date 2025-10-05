import "../utils/requireLogin";
import { checkTokenRefresh } from "../utils/tokenRefresh";
import "./admin.scss";
import { displayFiles, initShow } from "./modules/displayFiles";
import { getMailBody, getMailDateElement, sort } from "./modules/mailUtils";
import { search, searchInput } from "./modules/search";
import { Mail } from "./modules/types";

checkTokenRefresh();
const app = qs("#app");
const notifications = qs("#notifications");

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
                    <button class="show" data-id="${mail._id}">${("View Files")}</button>
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

const event = new EventSource("/api/admin/sse");

event.onmessage = (event) => {
    const mail = JSON.parse(event.data) as Mail & { user: string };

    const mailEl = document.createElement("li");
    mailEl.style.backgroundColor = "#444";
    mailEl.innerHTML = `
        <h3 style="text-decoration: underline;" title="New mail">${mail.name}</h3>
        ${getMailDateElement(mail._id)}
        ${getMailBody(mail.txt)}
        <button class="show" data-id="${mail._id}">${("View Files")}</button>
        <div class="files-container" data-id="files-${mail._id}"></div>
    `;

    let userUl = qs(`user-details-${mail.user}`, 1).qs("ul");
    if (!userUl) {
        const userContainer = document.createElement("details");
        userContainer.innerHTML = `
            <summary style="text-decoration: underline;" title="New user">${mail.user}</summary>
            <div class="mails-container"><ul></ul></div>
        `;
        userContainer.dataset.id = `user-details-${mail.user}`;
        userContainer.style.backgroundColor = "#333";
        app.appendChild(userContainer);
        userUl = qs(`user-details-${mail.user}`, 1).qs("ul");
        userContainer.addEventListener("click", () => {
            userContainer.style.backgroundColor = "";
            userContainer.qs("summary").style.textDecoration = "";
        }, { once: true });
    }

    userUl.addUp(mailEl);
    mailEl.addEventListener("click", () => {
        mailEl.style.backgroundColor = "";
        mailEl.qs("h3").style.textDecoration = "";
    }, { once: true });

    displayFiles({
        name: mail.name,
        files: mail.files,
        apiPath: "/api/admin/files",
        user: mail.user,
        containerId: `files-${mail._id}`
    });
    if (searchInput.value) search();

    const notification = document.createElement("li");
    notification.innerHTML = `<b>${mail.user}</b> - <b>${mail.name}</b>`;
    notifications.appendChild(notification);
    notification.addEventListener("click", () => {
        notification.remove();
        searchInput.v(`user:${mail.user} name:${mail.name}`);
        search();
    }, { once: true });
}