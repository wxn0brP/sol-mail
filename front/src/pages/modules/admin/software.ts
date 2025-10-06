import { getMailDateText } from "#mail/mailUtils";

const verStatus = qs("#version-status");
const softwarePopup = qs("#software-notification");
const clientLatestUpdate = qs("#client-latest-update");

interface VersionInfo {
    success: boolean;
    isCurrent: boolean;
    currentSHA: string;
    remoteSHA: string;
}

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
    fetch("/api/admin/version").then((res) => res.json()).then((ver: VersionInfo) => {
        if (!ver.success) return setVerInfoStatus("red");

        if (ver.isCurrent)
            return setVerInfoStatus("green");

        qs("#toggle-software-notification").html("⬆️");
        setVerInfoStatus("orange");
        verStatus.clA("up")
        verStatus.attrib("title", t("Show Changelog"));
        verStatus.attrib("translate-title", "Show Changelog");
        verStatus.on("click", () =>
            window.open(`https://github.com/wxn0brP/sol-mail/compare/${ver.currentSHA}...${ver.remoteSHA}`));
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