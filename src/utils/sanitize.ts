export function sanitizeDirName(name: string): string {
    return name.replace(/[\/\?%*:|"<>^.]/g, "_");
}

export function sanitizeFileName(name: string): string {
    return name.replace(/[\/\?%*:|"<>^]/g, "_");
}