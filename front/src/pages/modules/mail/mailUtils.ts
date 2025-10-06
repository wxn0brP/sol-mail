import { Mail } from "#types";

export function getMailDate(id: string) {
    return parseInt(id.split("-")[0], 36);
}

export function getMailDateText(date: Date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    const fullDate = date.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    let shortDate: string;
    if (diffDay > 0) {
        shortDate = diffDay === 1 ? `1 ${t("day")} ${t("ago")}` : `${diffDay} ${t("days")} ${t("ago")}`;
    } else if (diffHour > 0) {
        shortDate = `${diffHour}h ${t("ago")}`;
    } else if (diffMin > 0) {
        shortDate = `${diffMin}m ${t("ago")}`;
    } else {
        shortDate = `${t("today")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }

    return {
        fullDate,
        shortDate
    }
}

export function getMailDateElement(id: string): string {
    const date = new Date(getMailDate(id));
    const { fullDate, shortDate } = getMailDateText(date);
    return `<p title="${fullDate}">${shortDate}</p>`;
}

export function getMailBody(txt: string) {
    if (!txt) return "";
    return `<pre>${txt}</pre>`;
}

export function sort(mails: Mail[]) {
    const map = new Map<string, number>();
    mails.forEach(m => map.set(m._id, getMailDate(m._id)));
    return mails.sort((a, b) => map.get(b._id) - map.get(a._id));
}