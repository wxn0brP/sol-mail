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

import { t } from "../i18n";
import { audio, code, image, video } from "../mail/extensions";
import { trapDialogFocus } from "./dialog";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("scss", scss);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("plaintext", plaintext);

export async function openFilePopup(url: string, filename: string) {
	document.querySelector(".file-popup")?.remove();

	const previous = document.activeElement as HTMLElement | null;
	const popup = document.createElement("div");
	popup.className = "file-popup";

	const content = document.createElement("div");
	content.className = "popup-content";
	content.setAttribute("role", "dialog");
	content.setAttribute("aria-modal", "true");
	content.setAttribute("aria-labelledby", "file-preview-title");

	const header = document.createElement("div");
	header.className = "popup-header";

	const title = document.createElement("h3");
	title.id = "file-preview-title";
	title.textContent = filename;

	const close = document.createElement("button");
	close.type = "button";
	close.className = "close-popup";
	close.setAttribute("aria-label", t("Close preview"));
	close.textContent = "×";

	header.append(title, close);

	const previewContainer = document.createElement("div");
	previewContainer.className = "file-preview-container";
	previewContainer.textContent = t("Loading preview") + "...";

	content.append(header, previewContainer);
	popup.appendChild(content);
	document.body.appendChild(popup);

	let unlock = () => {};

	function closePopup() {
		unlock();
		popup.remove();
		previous?.focus();
	}

	unlock = trapDialogFocus(content, closePopup);
	close.addEventListener("click", closePopup);
	popup.addEventListener("click", event => {
		if (event.target === popup) closePopup();
	});
	close.focus();

	const extension = filename.split(".").pop()?.toLowerCase() || "";
	const language = code[extension];

	if (image.includes(extension)) {
		const img = document.createElement("img");
		img.src = url;
		img.alt = filename;
		previewContainer.replaceChildren(img);
		return;
	}

	if (language) {
		try {
			const response = await fetch(url);
			if (!response.ok)
				throw new Error(`Failed to fetch: ${response.statusText}`);
			const text = await response.text();

			const codeElement = document.createElement("code");
			codeElement.className = `language-${language}`;
			codeElement.textContent = text;

			const pre = document.createElement("pre");
			pre.appendChild(codeElement);

			previewContainer.replaceChildren(pre);
			hljs.highlightElement(codeElement);
		} catch (error) {
			console.error(error);
			const message = document.createElement("p");
			message.textContent = t("Could not load file preview") + ".";
			previewContainer.replaceChildren(message);
		}
		return;
	}

	if (video.includes(extension)) {
		const videoElement = document.createElement("video");
		videoElement.src = url;
		videoElement.controls = true;
		previewContainer.replaceChildren(videoElement);
		return;
	}

	if (audio.includes(extension)) {
		const audioElement = document.createElement("audio");
		audioElement.src = url;
		audioElement.controls = true;
		previewContainer.replaceChildren(audioElement);
	}
}
