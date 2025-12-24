import { getMailDateText } from "#mail/mailUtils";

const verStatus = qs("#version-status");
const softwarePopup = qs("#software-notification");
const clientLatestUpdate = qs("#client-latest-update");

interface VersionInfo {
    success: boolean;
    isCurrent: boolean;
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
        verStatus.attrib("title", t("Click to update"));
        verStatus.attrib("translate-title", "Click to update");
        verStatus.on("click", async () => {
            verStatus.html(t("Updating")).css("color", "orange");

            const loading = document.createElement("span");
            verStatus.appendChild(loading);
            let i = 0;
            setInterval(() => loading.html(".".repeat(i++ % 4)), 300);

            const data = await fetch("/api/admin/auto-update").then(res => res.json());
            if (data.err) return alert(t(data.msg));
            alert(t("Please start server again") + ".");
            location.reload();
        });
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

setTimeout(() => {
    checkVersionStatus();
    checkClientLatestUpdate();
}, 500);

softwarePopup.fade = false;
qs("#toggle-software-notification").on("click", () => softwarePopup.fadeToggle());