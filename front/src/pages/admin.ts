import "../utils/requireLogin";
import { checkTokenRefresh } from "../utils/tokenRefresh";
import "./admin.scss";
import { displayFiles } from "./modules/displayFiles";
import "./modules/search";

checkTokenRefresh();
const app = qs("#app");

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
                    <button class="show" id="${user.name + "-" + mail.name}">View Files</button>
                    <div class="files-container" id="files-${user.name}-${mail.name}"></div>
                </li>
            `
        }).join("");

        const r = `
            <details class="user" id="user-details-${user.name}">
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
                mailName: `${user.name}/${mail.name}`,
                files: mail.files,
                apiPath: "/api/admin/files",
                container: qs(`#files-${user.name}-${mail.name}`)
            })
        });
    });

    app.addEventListener("click", (event) => {
        const target = event.target as HTMLButtonElement;
        if (target.classList.contains("show")) {
            const container = qs(`#files-${target.id}`);
            if (!container) return;
            container.style.display = container.style.display === "block" ? "" : "block";
        }
    });
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
        <button class="show" id="${data.user + "-" + data.name}">View Files</button>
        <div class="files-container" id="files-${data.user}-${data.name}"></div>
    `;

    let userUl = qs(`#user-details-${data.user} ul`);
    if (!userUl) {
        const userContainer = document.createElement("details");
        userContainer.innerHTML = `
            <summary style="text-decoration: underline;" title="New user">${data.user}</summary>
            <div class="mails-container"><ul></ul></div>
        `;
        userContainer.id = `user-details-${data.user}`;
        userContainer.style.backgroundColor = "#333";
        app.appendChild(userContainer);
        userUl = qs(`#user-details-${data.user} ul`);
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
        mailName: `${data.user}/${data.name}`,
        files: data.files,
        apiPath: "/api/admin/files",
        container: qs(`#files-${data.user}-${data.name}`)
    });
}