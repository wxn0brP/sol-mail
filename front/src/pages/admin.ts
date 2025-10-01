import "../utils/requireLogin";
import { checkTokenRefresh } from "../utils/tokenRefresh";
import "./admin.scss";
import { displayFiles, initShow } from "./modules/displayFiles";
import "./modules/search";

checkTokenRefresh();
const app = qs("#app");
const notifications = qs("#notifications");

interface User {
    name: string;
    mails: Mail[];
}

interface Mail {
    name: string;
    files: string[];
}

const data = await fetch("/api/admin/user-data").then(res => res.json()) as User[];

if (data) {
    app.innerHTML = data.map(user => {
        const mails = user.mails.map(mail => {
            return `
                <li>
                    <h3>${mail.name}</h3>
                    <button class="show" data-id="${user.name + "-" + mail.name}">View Files</button>
                    <div class="files-container" data-id="files-${user.name}-${mail.name}"></div>
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
                containerId: `files-${user.name}-${mail.name}`
            })
        });
    });

    initShow(app);
} else {
    app.innerHTML = `<p class="error-message">Could not connect to the server.</p>`;
}

const event = new EventSource("/api/admin/sse");

event.onmessage = (event) => {
    const data = JSON.parse(event.data) as { user: string, name: string, files: string[] };

    const mail = document.createElement("li");
    mail.style.backgroundColor = "#444";
    mail.innerHTML = `
        <h3 style="text-decoration: underline;" title="New mail">${data.name}</h3>
        <button class="show" data-id="${data.user + "-" + data.name}">View Files</button>
        <div class="files-container" data-id="files-${data.user}-${data.name}"></div>
    `;

    let userUl = qs(`user-details-${data.user}`, 1).qs("ul");
    if (!userUl) {
        const userContainer = document.createElement("details");
        userContainer.innerHTML = `
            <summary style="text-decoration: underline;" title="New user">${data.user}</summary>
            <div class="mails-container"><ul></ul></div>
        `;
        userContainer.dataset.id = `user-details-${data.user}`;
        userContainer.style.backgroundColor = "#333";
        app.appendChild(userContainer);
        userUl = qs(`user-details-${data.user}`, 1).qs("ul");
        userContainer.addEventListener("click", () => {
            userContainer.style.backgroundColor = "";
            userContainer.qs("summary").style.textDecoration = "";
        }, { once: true });
    }

    userUl.appendChild(mail);
    mail.addEventListener("click", () => {
        mail.style.backgroundColor = "";
        mail.qs("h3").style.textDecoration = "";
    }, { once: true });

    displayFiles({
        name: data.name,
        files: data.files,
        apiPath: "/api/admin/files",
        user: data.user,
        containerId: `files-${data.user}-${data.name}`
    });

    const notification = document.createElement("li");
    notification.innerHTML = `<b>${data.user}</b> - <b>${data.name}</b>`;
    notifications.appendChild(notification);
    notification.addEventListener("click", () => {
        notification.remove();
    }, { once: true });
}