import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";
import "highlight.js/styles/atom-one-dark.css";

import { image, audio, video, code } from "./extensions";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("scss", scss);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("plaintext", plaintext);

export async function openFilePopup(url: string, filename: string) {
    const existingPopup = document.querySelector(".file-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.className = "file-popup";
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h3>${filename}</h3>
                <button class="close-popup">&times;</button>
            </div>
            <div class="file-preview-container">${t("Loading preview")}...</div>
        </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector(".close-popup")?.addEventListener("click", () => popup.remove());
    popup.addEventListener("click", (e) => {
        if (e.target === popup) popup.remove();
    });

    const previewContainer = popup.querySelector(".file-preview-container") as HTMLElement;
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const language = code[extension];

    if (image.includes(extension)) {
        previewContainer.innerHTML = `<img src="${url}" alt="${filename}">`;
    } else if (language) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
            const text = await response.text();

            const code = document.createElement("code");
            code.className = `language-${language}`;
            code.textContent = text;

            const pre = document.createElement("pre");
            pre.appendChild(code);

            previewContainer.innerHTML = "";
            previewContainer.appendChild(pre);

            hljs.highlightElement(code);
        } catch (e) {
            console.error(e);
            previewContainer.innerHTML = `<p>${t("Could not load file preview")}.</p>`;
        }
    } else if (video.includes(extension)) {
        previewContainer.innerHTML = `<video src="${url}" controls></video>`;
    } else if (audio.includes(extension)) {
        previewContainer.innerHTML = `<audio src="${url}" controls></audio>`;
    }
}
