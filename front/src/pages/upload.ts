import { _confirm } from "_popup";
import "_requireLogin";
import { checkTokenRefresh } from "_tokenRefresh";
import "./upload.scss";

checkTokenRefresh();
const uploadForm = qs("form");

const fileInput = qi("#filefield");
const filesList = qs("#filesList");
const mailNameInput = qi("#mailName");
const mailNameSelect = qi("#mailNameSelect");
const bodyInput = qi("#body");
const message = qs("#message");

let selectedFiles: File[] = [];
fileInput.addEventListener("change", async (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
        for (let i = 0; i < files.length; i++) {
            const existsIndex = selectedFiles.findIndex(f => f.name === files[i].name);
            if (existsIndex !== -1) {
                const conf = await _confirm(t("A file '$' with the same name already exists. Do you want to replace it").replace("$", files[i].name) + "?");
                if (conf) continue;
                selectedFiles.splice(existsIndex, 1);
            }
            selectedFiles.push(files[i]);
        }
        updateFilesList();
    }
    (event.target as HTMLInputElement).value = "";
});

function updateFilesList() {
    filesList.innerHTML = "";
    selectedFiles.forEach((file, index) => {
        const li = document.createElement("li");

        const fileNameSpan = document.createElement("span");
        fileNameSpan.innerHTML = file.name;

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "X";
        removeBtn.addEventListener("click", () => {
            selectedFiles.splice(index, 1);
            updateFilesList();
        });

        li.appendChild(fileNameSpan);
        li.appendChild(removeBtn);
        filesList.appendChild(li);
    });
}

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const mailName = mailNameInput.value.trim();
    if (!mailName) {
        message.textContent = t("Please enter a mail name");
        return;
    }
    const body = bodyInput.value.trim();

    if (selectedFiles.length === 0) {
        const conf = await _confirm(t("Are you sure you want to upload an empty file") + "?", true);
        if (!conf) return;
    }

    const formData = new FormData();
    formData.append("mailName", mailName);
    if (body)
        formData.append("body", body);

    for (const file of selectedFiles) {
        formData.append("filefield", file);
    }

    const res = await fetch(`/api/files/${encodeURIComponent(mailName)}`, {
        method: "POST",
        body: formData
    }).then(res => res.json());

    if (res.err) {
        message.innerHTML = t(res.msg);
        message.attrib("translate", res.msg);
    } else {
        message.innerHTML = t("Upload finished");
        message.attrib("translate", "Upload finished");
        mailNameInput.value = "";
        bodyInput.value = "";
        selectedFiles = [];
        updateFilesList();
    }
});

fetch("/api/data/subjects").then(res => res.json()).then(subjects => {
    mailNameSelect.innerHTML = `<option value="">${t("My name")}</option>`;
    for (const subject of subjects) {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        mailNameSelect.appendChild(option);
    }
});

qs("#mailNameSelect").on("change", () => {
    mailNameInput.value = mailNameSelect.value;
    mailNameInput.style.display = mailNameSelect.value ? "none" : "";
});