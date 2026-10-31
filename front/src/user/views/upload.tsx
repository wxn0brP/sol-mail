import { api } from "#/shared/api";
import { qs } from "#/shared/dom";
import { t } from "#/shared/i18n";
import { cells } from "#/shared/state";
import { isError } from "#/shared/types";
import { _confirm } from "#/shared/ui/popup";
import { UiView } from "@wxn0brp/flanker-ui";
import "#/styles/upload.scss";

export class UploadView extends UiView {
	private selectedFiles: File[] = [];

	mounted() {
		this.paint();
		this.loadSubjects();
		cells.subjects.subscribe(() => this.paintSubjects());
	}

	onUpdate() {
		this.paint();
		this.loadSubjects();
	}

	private paint() {
		this.element.innerHTML = this.markup();
		this.bind();
		this.paintFiles();
	}

	private markup() {
		return (
			<div id="upload-view">
				<h1>{t("File Upload")}</h1>
				<form>
					<div>
						<label for="mailName">
							<span>{t("Subject")}</span>:
						</label>
						<select
							name="mailNameSelect"
							id="mailNameSelect"
							aria-label={t("Choose subject")}>
							<option value="">{t("My name")}</option>
							{cells.subjects.get().map(subject => (
								<option value={subject}>{subject}</option>
							))}
						</select>
						<input
							type="text"
							name="mailName"
							id="mailName"
							placeholder={t("Enter mail name")}
							required
						/>
					</div>
					<div>
						<label for="body">
							<span>{t("Content")}</span>:
						</label>
						<textarea
							name="body"
							id="body"
							placeholder={t("Enter mail content")}></textarea>
					</div>
					<div>
						<label for="filefield">
							<span>{t("Files")}</span>:
						</label>
						<input type="file" name="filefield" id="filefield" multiple />
					</div>
					<ul id="filesList"></ul>
					<button type="submit">{t("Send Mail")}</button>
				</form>
				<p id="message" class="message" role="status" aria-live="polite"></p>
			</div>
		);
	}

	private bind() {
		const form = qs<HTMLFormElement>("form", this.element);
		const fileInput = qs<HTMLInputElement>("#filefield", this.element);
		const filesList = qs<HTMLElement>("#filesList", this.element);
		const mailNameInput = qs<HTMLInputElement>("#mailName", this.element);
		const mailNameSelect = qs<HTMLSelectElement>(
			"#mailNameSelect",
			this.element,
		);
		const message = qs<HTMLElement>("#message", this.element);
		if (
			!form ||
			!fileInput ||
			!filesList ||
			!mailNameInput ||
			!mailNameSelect ||
			!message
		)
			return;

		fileInput.addEventListener("change", async event => {
			const files = (event.target as HTMLInputElement).files;
			if (!files) return;

			for (let i = 0; i < files.length; i++) {
				const duplicateIndex = this.selectedFiles.findIndex(
					file => file.name === files[i].name,
				);
				if (duplicateIndex !== -1) {
					const confirmed = await _confirm(
						t(
							"A file '$' with the same name already exists. Do you want to replace it",
						).replace("$", files[i].name) + "?",
					);
					if (confirmed) continue;
					this.selectedFiles.splice(duplicateIndex, 1);
				}
				this.selectedFiles.push(files[i]);
			}
			this.paintFiles();
			fileInput.value = "";
		});

		filesList.addEventListener("click", event => {
			const button = (event.target as HTMLElement).closest("button");
			if (!button || button.dataset.index === undefined) return;
			this.selectedFiles.splice(+button.dataset.index, 1);
			this.paintFiles();
		});

		mailNameSelect.addEventListener("change", () => {
			mailNameInput.value = mailNameSelect.value;
			mailNameInput.style.display = mailNameSelect.value ? "none" : "";
		});

		form.addEventListener("submit", async event => {
			event.preventDefault();

			const mailName = mailNameInput.value.trim();
			if (!mailName) {
				message.textContent = t("Please enter a mail name");
				return;
			}

			const bodyInput = qs<HTMLTextAreaElement>("#body", this.element)!;
			const body = bodyInput.value.trim();

			if (this.selectedFiles.length === 0) {
				const confirmed = await _confirm(
					t("Are you sure you want to upload an empty file") + "?",
					true,
				);
				if (!confirmed) return;
			}

			const result = await api.files.upload(mailName, body, this.selectedFiles);

			if (isError(result)) {
				message.textContent = t(result.msg);
				return;
			}

			message.textContent = t("Upload finished");
			mailNameInput.value = "";
			bodyInput.value = "";
			mailNameSelect.value = "";
			mailNameInput.style.display = "";
			this.selectedFiles = [];
			this.paintFiles();
		});
	}

	private async loadSubjects() {
		const result = await api.data.subjects();
		if (Array.isArray(result)) cells.subjects.set(result);
	}

	private paintSubjects() {
		const select = qs<HTMLSelectElement>("#mailNameSelect", this.element);
		if (!select) return;

		const current = select.value;
		select.innerHTML = "";
		const empty = document.createElement("option");
		empty.value = "";
		empty.textContent = t("My name");
		select.appendChild(empty);

		for (const subject of cells.subjects.get()) {
			const option = document.createElement("option");
			option.value = subject;
			option.textContent = subject;
			select.appendChild(option);
		}
		select.value = current;
	}

	private paintFiles() {
		const filesList = qs<HTMLElement>("#filesList", this.element);
		if (!filesList) return;

		filesList.innerHTML = "";
		this.selectedFiles.forEach((file, index) => {
			const li = document.createElement("li");

			const name = document.createElement("span");
			name.textContent = file.name;

			const remove = document.createElement("button");
			remove.type = "button";
			remove.textContent = "X";
			remove.dataset.index = String(index);
			remove.setAttribute("aria-label", `${t("Remove file")}: ${file.name}`);
			remove.title = t("Remove file");

			li.appendChild(name);
			li.appendChild(remove);
			filesList.appendChild(li);
		});
	}
}
