import { api } from "#/shared/api";
import { qs } from "#/shared/dom";
import { t } from "#/shared/i18n";
import { cells } from "#/shared/state";
import { UiView } from "@wxn0brp/flanker-ui";

export class SubjectsView extends UiView {
	private loading = true;

	mounted() {
		this.paint();
		cells.subjects.subscribe(() => this.paintList());
		this.load();
	}

	onUpdate() {
		this.paint();
		this.load();
	}

	private paint() {
		this.element.innerHTML = this.markup();
		this.bind();
	}

	private async load() {
		this.loading = true;
		this.paintList();

		const result = await api.data.subjects();
		this.loading = false;
		if (Array.isArray(result)) cells.subjects.set(result);
		else this.paintList();
	}

	private markup() {
		return (
			<div id="subjects-view">
				<h1>{t("Manage Subjects")}</h1>
				<article id="manage-subjects">
					<div class="subject-add">
						<input
							type="text"
							id="add-subject-input"
							placeholder={t("New subject")}
							aria-label={t("New subject")}
						/>
						<button id="add-subject" type="button">
							{t("Add")}
						</button>
					</div>
					<div id="manage-subjects-list"></div>
				</article>
			</div>
		);
	}

	private bind() {
		const input = qs<HTMLInputElement>("#add-subject-input", this.element);
		const addButton = qs<HTMLButtonElement>("#add-subject", this.element);
		const list = qs<HTMLElement>("#manage-subjects-list", this.element);

		addButton?.addEventListener("click", () => {
			if (!input) return;
			const subject = input.value.trim();
			if (!subject) return;

			cells.subjects.set([
				...cells.subjects.get(),
				subject,
			]);
			api.admin.subjectAdd(subject);
			input.value = "";
		});

		list?.addEventListener("click", event => {
			const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
				".remove",
			);
			const subject = button?.dataset.subject;
			if (!subject) return;

			cells.subjects.set(cells.subjects.get().filter(item => item !== subject));
			api.admin.subjectRemove(subject);
		});

		this.paintList();
	}

	private paintList() {
		const list = qs<HTMLElement>("#manage-subjects-list", this.element);
		if (!list) return;

		list.innerHTML = "";

		if (this.loading) {
			const loading = document.createElement("p");
			loading.className = "status-message";
			loading.textContent = t("Loading") + "...";
			list.appendChild(loading);
			return;
		}

		if (cells.subjects.get().length === 0) {
			const empty = document.createElement("p");
			empty.className = "empty-state";
			empty.textContent = t("No subjects yet. Add one to create a preset");
			list.appendChild(empty);
			return;
		}

		for (const subject of cells.subjects.get()) {
			const item = document.createElement("div");
			item.className = "subject-item";

			const remove = document.createElement("button");
			remove.type = "button";
			remove.className = "remove";
			remove.dataset.subject = subject;
			remove.textContent = "×";
			remove.setAttribute("aria-label", `${t("Remove subject")}: ${subject}`);

			const name = document.createElement("span");
			name.className = "subject-name";
			name.textContent = subject;

			item.appendChild(name);
			item.appendChild(remove);
			list.appendChild(item);
		}
	}
}
