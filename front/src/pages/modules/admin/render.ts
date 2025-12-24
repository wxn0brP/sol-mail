import { displayFiles } from "#mail/displayFiles";
import { getMailBody, getMailDateElement, sort } from "#mail/mailUtils";
import { app, data } from "@admin";
import { search, searchInput } from "./search";
import { GroupBy, GroupedByMail } from "./types";

function renderByUser() {
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
            `;
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
        `;
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
}

function renderByMailName() {
    const groupedData: GroupedByMail[] = [];
    data.forEach(user => {
        user.mails.forEach(mail => {
            let group = groupedData.find(g => g.name === mail.name);
            if (!group) {
                group = { name: mail.name, users: [] };
                groupedData.push(group);
            }
            group.users.push({ name: user.name, mail: mail });
        });
    });

    app.innerHTML = groupedData.sort((a, b) => a.name.localeCompare(b.name)).map(group => {
        const userMails = group.users.map(userData => {
            const mail = userData.mail;
            return `
                <li>
                    <h3>${userData.name}</h3>
                    ${getMailDateElement(mail._id)}
                    ${getMailBody(mail.txt)}
                    <button class="show" data-id="${mail._id}">${t("View Files")}</button>
                    <div class="files-container" data-id="files-${mail._id}"></div>
                </li>
            `;
        }).join("");

        return `
            <details class="user" data-id="mail-details-${group.name}">
                <summary>${group.name}</summary>
                <div class="mails-container">
                    <ul>
                        ${userMails}
                    </ul>
                </div>
            </details>
            `;
    }).join("");

    groupedData.forEach(group => {
        group.users.forEach(userData => {
            displayFiles({
                name: userData.mail.name,
                files: userData.mail.files,
                apiPath: "/api/admin/files",
                user: userData.name,
                containerId: `files-${userData.mail._id}`
            });
        });
    });
}

export function renderData(groupBy: GroupBy) {
    if (!data) {
        app.innerHTML = `<p class="error-message">${t("Could not connect to the server")}.</p>`;
        return;
    }

    if (groupBy === "user") renderByUser();
    else if (groupBy === "mailName") renderByMailName();

    setTimeout(() => {
        if (searchInput.value) search();
    }, 10);
}