export function getMailDate(id: string) {
    return parseInt(id.split("-")[0], 36);
}

export function getMailDateElement(id: string): string {
    const ts = getMailDate(id);
    const date = new Date(ts);

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
        shortDate = diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
    } else if (diffHour > 0) {
        shortDate = `${diffHour}h ago`;
    } else if (diffMin > 0) {
        shortDate = `${diffMin}m ago`;
    } else {
        shortDate = `today ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }

    return `<p title="${fullDate}">${shortDate}</p>`;
}

export function getMailBody(txt: string) {
    if (!txt) return "";
    return `<pre>${txt}</pre>`;
}