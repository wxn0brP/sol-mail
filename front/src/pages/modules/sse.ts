import { app } from "../admin";
import { displayFiles } from "./displayFiles";
import { getMailDateElement, getMailBody } from "./mailUtils";
import { searchInput, search } from "./search";
import { Mail } from "./types";

const notifications = qs("#notifications");
const notificationsContainer = qs("#mail-notification");
let notificationsCount = 0;

const event = new EventSource("/api/admin/sse");

event.onmessage = (event) => {
    const mail = JSON.parse(event.data) as Mail & { user: string };

    const mailEl = document.createElement("li");
    mailEl.style.backgroundColor = "#444";
    mailEl.innerHTML = `
        <h3 style="text-decoration: underline;" title="New mail">${mail.name}</h3>
        ${getMailDateElement(mail._id)}
        ${getMailBody(mail.txt)}
        <button class="show" data-id="${mail._id}">${t("View Files")}</button>
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
        notificationsCount--;
        updateNotification();
        search();
    }, { once: true });
    notificationsCount++;
    updateNotification();
}

function updateNotification() {
    notificationsContainer.style.display = notificationsCount ? "" : "none";
}
updateNotification();

window.addEventListener("beforeunload", () => event.close());