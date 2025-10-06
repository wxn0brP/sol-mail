export const image = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];
export const audio = ["mp3", "wav", "ogg", "m4a"];
export const video = ["mp4", "webm", "ogv"];
export const doc = ["doc", "docx", "pdf"];
export const sheet = ["xls", "xlsx", "csv"];
export const archive = ["zip", "rar", "7z", "tar", "gz"];

export const code: { [key: string]: string } = {
    "js": "javascript",
    "ts": "typescript",
    "json": "json",
    "html": "xml",
    "css": "css",
    "scss": "scss",
    "md": "markdown",
    "xml": "xml",
    "txt": "plaintext",
    "log": "plaintext"
};

export const textCode = Object.keys(code);
export const popupSupported = [
    ...image,
    ...audio,
    ...video,
    ...textCode,
]
