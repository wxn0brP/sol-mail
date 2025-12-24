import "#admin/mailSubjects";
import { renderData } from "#admin/render";
import "#admin/software";
import "#admin/sse";
import { GroupBy, User as UserAndMails } from "#admin/types";
import { initShow } from "#mail/displayFiles";
import "_requireLogin";
import { checkTokenRefresh } from "_tokenRefresh";
import "./admin.scss";

checkTokenRefresh();
export const app = qs("#app");
const groupBySelect = qs<HTMLSelectElement>("#group-by");
export const data = await fetch("/api/admin/user-data").then(res => res.json()) as UserAndMails[];

if (data) {
    renderData(groupBySelect.value as GroupBy);

    groupBySelect.addEventListener("change", () => {
        renderData(groupBySelect.value as GroupBy);
    });

    initShow(app);
} else {
    app.innerHTML = `<p class="error-message">${t("Could not connect to the server")}.</p>`;
}