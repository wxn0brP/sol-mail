import "../utils/requireLogin";
import { checkTokenRefresh } from "../utils/tokenRefresh";
import "./upload.scss";

checkTokenRefresh();
const uploadForm = qs("form");

const fileInput = qi("#filefield");
const mailNameInput = qi("#mailName");
const bodyInput = qi("#body");
const message = qs("#message");

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const mailName = mailNameInput.value.trim();
    if (!mailName) {
        message.textContent = t("Please enter a mail name");
        return;
    }
    const body = bodyInput.value.trim();

    if (fileInput.files.length === 0) {
        const conf = confirm(t("Are you sure you want to upload an empty file") + "?");
        if (!conf) return;
    }

    const formData = new FormData();
    formData.append("mailName", mailName);
    if (body)
        formData.append("body", body);

    for (const file of fileInput.files) {
        formData.append("filefield", file);
    }

    const res = await fetch(`/api/files/${encodeURIComponent(mailName)}`, {
        method: "POST",
        body: formData
    }).then(res => res.json());

    if (res.err) {
        message.innerHTML = res.msg;
    } else {
        message.innerHTML = "Upload finished.";
        mailNameInput.value = "";
        fileInput.value = "";
    }
});