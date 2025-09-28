import "../utils/requireLogin";
import { checkTokenRefresh } from "../utils/tokenRefresh";
import "./mails.scss";
import { fetchMails } from "./modules/api";
import { displayMails } from "./modules/ui";

checkTokenRefresh();
const mailsContainer = qs(".mails-container");

try {
    const res = await fetchMails();
    if (res.err) {
        mailsContainer.innerHTML = `<p class="error-message">${res.msg}</p>`;
    } else {
        displayMails(res.mails, mailsContainer);
    }
} catch (error) {
    console.error("Failed to load mails:", error);
    mailsContainer.innerHTML = `<p class="error-message">Could not connect to the server.</p>`;
}