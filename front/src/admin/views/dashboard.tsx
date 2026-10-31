import { api } from "#/shared/api";
import { qs } from "#/shared/dom";
import { t } from "#/shared/i18n";
import { bindMailList } from "#/shared/mail/displayFiles";
import { mailItem } from "#/shared/mail/mailItem";
import { sort } from "#/shared/mail/mailUtils";
import { cells } from "#/shared/state";
import {
	type GroupBy,
	type GroupedByMail,
	isError,
	type User,
} from "#/shared/types";
import { UiView } from "@wxn0brp/flanker-ui";

export class DashboardView extends UiView {
	private groupBy: GroupBy = "user";
	private error = "";
	private loading = true;

	mounted() {
		this.paint();
		cells.adminData.subscribe(() => this.paintContent());
		cells.search.subscribe(() => this.paintContent());
		this.load();
	}

	onUpdate() {
		this.load();
	}

	private paint() {
		this.element.innerHTML = this.markup();
		this.bind();
	}

	private async load() {
		this.loading = true;
		this.error = "";
		this.paint();

		const result = await api.admin.userData();
		if (isError(result)) {
			this.error = t(result.msg);
		} else {
			cells.adminData.set(result as User[]);
		}
		this.loading = false;
		this.paint();
	}

	private markup() {
		return (
			<div id="admin-dashboard">
				<h1>{t("Users Mails")}</h1>
				<section id="search-container">
					<label for="search">
						<span>{t("Search")}</span>:
					</label>
					<div>
						<input
							placeholder={t(
								"Available masks: user:$user, name:$name, file:$file",
							)}
							id="search"
						/>
						<button
							id="search-clear"
							type="button"
							aria-label={t("Clear search")}
							title={t("Clear search")}>
							X
						</button>
					</div>
				</section>
				<section id="sorting-options-container">
					<label for="group-by">{t("Group by")}:</label>
					<select id="group-by">
						<option value="user" selected={this.groupBy === "user"}>
							{t("User")}
						</option>
						<option value="mailName" selected={this.groupBy === "mailName"}>
							{t("Mail Name")}
						</option>
					</select>
				</section>
				<div id="admin-content"></div>
			</div>
		);
	}

	private bind() {
		const searchInput = qs<HTMLInputElement>("#search", this.element);
		const searchClear = qs<HTMLButtonElement>("#search-clear", this.element);
		const groupBy = qs<HTMLSelectElement>("#group-by", this.element);

		searchInput?.addEventListener("input", () => this.applySearch());
		searchClear?.addEventListener("click", () => {
			if (!searchInput) return;
			searchInput.value = "";
			this.applySearch();
		});
		groupBy?.addEventListener("change", () => {
			this.groupBy = groupBy.value as GroupBy;
			this.paintContent();
		});

		this.paintContent();
	}

	private paintContent() {
		const content = qs<HTMLElement>("#admin-content", this.element);
		if (!content) return;

		if (this.loading) {
			content.innerHTML = "";
			const loading = document.createElement("p");
			loading.className = "status-message";
			loading.textContent = t("Loading your mails") + "...";
			content.appendChild(loading);
			return;
		}

		if (this.error) {
			content.innerHTML = "";
			const error = document.createElement("p");
			error.className = "error-message";
			error.textContent = this.error;
			content.appendChild(error);
			return;
		}

		if (cells.adminData.get().length === 0) {
			content.innerHTML = "";
			const empty = document.createElement("p");
			empty.className = "empty-state";
			empty.textContent = t("No mails yet. New submissions will appear here");
			content.appendChild(empty);
			return;
		}

		const pending = cells.search.get();
		if (pending) {
			cells.search.set("");
			const searchInput = qs<HTMLInputElement>("#search", this.element);
			if (searchInput) searchInput.value = pending;
		}

		content.innerHTML =
			this.groupBy === "user" ? this.renderByUser() : this.renderByMailName();

		const noResults = document.createElement("p");
		noResults.id = "search-empty";
		noResults.className = "empty-state";
		noResults.hidden = true;
		noResults.textContent = t("No results for this search");
		content.appendChild(noResults);

		bindMailList(content);
		this.applySearch();
	}

	private renderByUser() {
		const users = [
			...cells.adminData.get(),
		].sort((a, b) => b.name.localeCompare(a.name));

		return users
			.map(user => (
				<details class="user" data-id={`user-details-${user.name}`}>
					<summary>{user.name}</summary>
					<div class="mails-container">
						<ul>
							{sort(user.mails).map(mail =>
								mailItem(mail, "/api/admin/files", user.name),
							)}
						</ul>
					</div>
				</details>
			))
			.join("");
	}

	private renderByMailName() {
		const grouped: GroupedByMail[] = [];
		for (const user of cells.adminData.get()) {
			for (const mail of user.mails) {
				let group = grouped.find(group => group.name === mail.name);
				if (!group) {
					group = {
						name: mail.name,
						users: [],
					};
					grouped.push(group);
				}
				group.users.push({
					name: user.name,
					mail,
				});
			}
		}

		return grouped
			.sort((a, b) => a.name.localeCompare(b.name))
			.map(group => (
				<details class="user" data-id={`mail-details-${group.name}`}>
					<summary>{group.name}</summary>
					<div class="mails-container">
						<ul>
							{group.users.map(userData =>
								mailItem(userData.mail, "/api/admin/files", userData.name),
							)}
						</ul>
					</div>
				</details>
			))
			.join("");
	}

	private applySearch() {
		const content = qs<HTMLElement>("#admin-content", this.element);
		const searchInput = qs<HTMLInputElement>("#search", this.element);
		if (!content || !searchInput) return;

		const openUsers = new Set<HTMLElement>();
		content.querySelectorAll<HTMLElement>(".user[open]").forEach(user => {
			openUsers.add(user);
		});

		const searchTerm = searchInput.value.toLowerCase().trim();
		const filters = {
			user: [] as string[],
			name: [] as string[],
			file: [] as string[],
			text: [] as string[],
		};

		for (const term of searchTerm.split(/\s+/).filter(Boolean)) {
			const separatorIndex = term.indexOf(":");

			if (separatorIndex > 0 && separatorIndex < term.length - 1) {
				const key = term.substring(0, separatorIndex);
				const value = term.substring(separatorIndex + 1);
				switch (key) {
					case "user":
						filters.user.push(value);
						break;
					case "name":
						filters.name.push(value);
						break;
					case "file":
						filters.file.push(value);
						break;
					default:
						filters.text.push(term);
						break;
				}
			} else {
				filters.text.push(term);
			}
		}

		let anyVisible = false;

		content.querySelectorAll<HTMLElement>(".user").forEach(userElement => {
			const userName =
				userElement.querySelector("summary")?.textContent?.toLowerCase() || "";
			const mailElements = userElement.querySelectorAll<HTMLElement>(
				".mails-container > ul > li",
			);
			let userHasVisibleMails = false;

			mailElements.forEach(mailElement => {
				const mailName =
					mailElement.querySelector("h3")?.textContent?.toLowerCase() || "";
				const fileLinks =
					mailElement.querySelectorAll<HTMLAnchorElement>(".files-container a");
				const fileNames = Array.from(fileLinks).map(
					file => file.dataset.filename?.toLowerCase() || "",
				);

				const userMatch =
					filters.user.length === 0 ||
					filters.user.some(term => userName.includes(term));
				const nameMatch =
					filters.name.length === 0 ||
					filters.name.some(term => mailName.includes(term));
				const fileMatch =
					filters.file.length === 0 ||
					filters.file.some(term =>
						fileNames.some(name => name.includes(term)),
					);

				const allText = [
					userName,
					mailName,
					...fileNames,
				];
				const textMatch =
					filters.text.length === 0 ||
					filters.text.every(term =>
						allText.some(content => content.includes(term)),
					);

				if (userMatch && nameMatch && fileMatch && textMatch) {
					mailElement.style.display = "";
					userHasVisibleMails = true;
				} else {
					mailElement.style.display = "none";
				}
			});

			if (userHasVisibleMails) {
				userElement.style.display = "";
				anyVisible = true;
				if (openUsers.has(userElement) || searchTerm)
					userElement.setAttribute("open", "");
			} else {
				userElement.style.display = "none";
				userElement.removeAttribute("open");
			}
		});

		const noResults = content.querySelector<HTMLElement>("#search-empty");
		if (noResults) noResults.hidden = !searchTerm || anyVisible;
	}
}
