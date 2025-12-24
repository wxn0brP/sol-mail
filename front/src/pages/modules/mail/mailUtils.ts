import { Mail } from "#types";

export function getMailDate(id: string) {
    return parseInt(id.split("-")[0], 36);
}

export function getMailDateText(date: Date) {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const rtf = new Intl.RelativeTimeFormat(document.documentElement.lang, { numeric: "auto" });
    let relativeValue: number;
    let unit: Intl.RelativeTimeFormatUnit;

    if (diffYears < -1) {
        relativeValue = diffYears;
        unit = "year";
    } else if (diffMonths < -1) {
        relativeValue = diffMonths;
        unit = "month";
    } else if (diffWeeks < -1) {
        relativeValue = diffWeeks;
        unit = "week";
    } else if (diffDays < -1) {
        relativeValue = diffDays;
        unit = "day";
    } else if (diffHrs < -1) {
        relativeValue = diffHrs;
        unit = "hour";
    } else if (diffMin < -1) {
        relativeValue = diffMin;
        unit = "minute";
    } else {
        relativeValue = -1;
        unit = "second";
    }

    const fullDate = date.toLocaleString(document.documentElement.lang, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    return {
        fullDate,
        shortDate: rtf.format(relativeValue, unit)
    };
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