export function parseTimeToMs(timeString: string): number {
    const timeValue = parseInt(timeString.slice(0, -1));
    const timeUnit = timeString.slice(-1);

    if (isNaN(timeValue)) {
        return 2 * 60 * 60 * 1000;
    }

    switch (timeUnit) {
        case "h":
            return timeValue * 60 * 60 * 1000;
        case "d":
            return timeValue * 24 * 60 * 60 * 1000;
        case "m":
            return timeValue * 60 * 1000;
        default:
            return 2 * 60 * 60 * 1000;
    }
}