export async function fetchMails() {
    return await fetch("/api/files").then(res => res.json());
}

export async function fetchFiles(mailName: string) {
    return await fetch(`/api/files/${encodeURIComponent(mailName)}`).then(res => res.json());
}