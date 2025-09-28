import "./upload.scss";
import "../utils/requireLogin";
const uploadForm = qs("form");

const fileInput = qs("#filefield") as HTMLInputElement;
const mailNameInput = qs("#mailName") as HTMLInputElement;
const message = qs("#message");

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const mailName = mailNameInput.value.trim();
    if (!mailName) {
        message.textContent = "Please enter a mail name";
        return;
    }

    const formData = new FormData();
    formData.append("mailName", mailName);

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