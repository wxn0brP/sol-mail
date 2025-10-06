import { getMailDate, getMailDateElement, getMailDateText } from "./mailUtils";

const verStatus = qs("#version-status");
const softwarePopup = qs("#software-notification");
const clientLatestUpdate = qs("#client-latest-update");

const versionInfo = {
    green: "Up to date",
    orange: "Update available",
    red: "Checking Error",
    "#f00": " Connection error"
}

function setVerInfoStatus(color: string) {
    verStatus.html(versionInfo[color]).css("color", color);
}

function checkVersionStatus() {
    fetch("/api/admin/version").then((res) => res.json()).then((ver) => {
        if (!ver.sha) return setVerInfoStatus("red");
        if (!ver.isCurrent) qs("#toggle-software-notification").html("⬆️");
        return setVerInfoStatus(ver.isCurrent ? "green" : "orange");
    }).catch((err) => {
        console.error("Error fetching version info:", err);
        setVerInfoStatus("#f00");
    });
}

function checkClientLatestUpdate() {
    fetch("https://api.github.com/repos/wxn0brP/sol-mail-client/releases/latest").then((res) => res.json()).then((ver) => {
        const updated = ver.updated_at;
        const date = new Date(updated);
        const { fullDate, shortDate } = getMailDateText(date);
        clientLatestUpdate.html(shortDate).css("color", "green").attrib("title", fullDate);
    }).catch((err) => {
        console.error("Error fetching version info:", err);
        clientLatestUpdate.html("Error").css("color", "#f00");
    });
}

checkVersionStatus();
checkClientLatestUpdate();

softwarePopup.fade = false;
qs("#toggle-software-notification").on("click", () => softwarePopup.fadeToggle())