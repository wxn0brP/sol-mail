import { logout } from "../auth";
import { byId } from "../dom";
import { availableLangs, getLang, setLang, t } from "../i18n";
import { store } from "../state";
import { _confirm, _select } from "./popup";

export interface NavItem {
	href: string;
	key: string;
}

export class Nav {
	constructor(private items: NavItem[] | (() => NavItem[])) {}

	mount() {
		const el = byId("nav");
		if (!el) return;
		this.paint(el);
		window.addEventListener("hashchange", () => this.refresh(el));
		store.lang.subscribe(() => this.paint(el));
		store.loggedIn.subscribe(() => this.paint(el));
	}

	private getItems() {
		return typeof this.items === "function" ? this.items() : this.items;
	}

	private paint(el: HTMLElement) {
		el.innerHTML = this.render();
		this.bind(el);
		this.refresh(el);
	}

	private render() {
		const name = store.userName.get();

		return (
			<>
				<button
					class="nav-toggle"
					type="button"
					aria-label={t("Toggle navigation")}
					aria-expanded="false"
					aria-controls="nav-menu">
					<span></span>
					<span></span>
					<span></span>
				</button>
				<div id="who-div">
					{name ? (
						<button
							id="who"
							type="button"
							aria-pressed="false"
							title={t("Click to reveal")}>
							{t("Click to reveal")}
						</button>
					) : null}
				</div>
				<ul id="nav-menu">
					{this.getItems().map(item => (
						<li>
							<a href={item.href} data-key={item.key}>
								{t(item.key)}
							</a>
						</li>
					))}
					<li>
						<button type="button" id="logout">
							{t("Logout")}
						</button>
					</li>
					<li>
						<button
							type="button"
							id="change-lang"
							aria-label={t("Change language")}
							title={t("Change language")}>
							🌐
						</button>
					</li>
				</ul>
				<button
					id="open-info"
					type="button"
					aria-label={t("About Sol Mail")}
					title={t("About Sol Mail")}>
					💜
				</button>
			</>
		);
	}

	private bind(el: HTMLElement) {
		const menu = el.querySelector<HTMLElement>("#nav-menu");
		const toggle = el.querySelector<HTMLButtonElement>(".nav-toggle");

		const closeMenu = () => {
			menu?.classList.remove("show");
			toggle?.setAttribute("aria-expanded", "false");
		};

		toggle?.addEventListener("click", () => {
			if (!menu) return;
			const open = menu.classList.toggle("show");
			toggle.setAttribute("aria-expanded", String(open));
		});

		el.querySelectorAll("#nav-menu a").forEach(link => {
			link.addEventListener("click", closeMenu);
		});

		const who = el.querySelector<HTMLButtonElement>("#who");
		const name = store.userName.get();
		if (who && name) {
			let revealed = false;
			who.addEventListener("click", () => {
				revealed = !revealed;
				who.textContent = revealed ? name : t("Click to reveal");
				who.setAttribute("aria-pressed", String(revealed));
			});
		}

		el.querySelector("#logout")?.addEventListener("click", async () => {
			const confirmed = await _confirm(
				t("Are you sure you want to logout") + "?",
			);
			if (!confirmed) return;
			await logout();
			location.hash = "#/login";
		});

		el.querySelector("#change-lang")?.addEventListener("click", async () => {
			const langs = await availableLangs();
			const lang = await _select(t("Select your language"), langs, getLang());
			if (lang) await setLang(lang);
		});

		const footer = document.querySelector<HTMLElement>("footer");
		let animation = false;
		el.querySelector("#open-info")?.addEventListener("click", () => {
			if (animation || !footer) return;
			animation = true;
			footer.style.display = "";

			setTimeout(() => {
				animation = false;
				footer.style.display = "none";
			}, 9980);
		});
	}

	private refresh(el: HTMLElement) {
		el.hidden = location.hash.startsWith("#/login");

		el.querySelectorAll<HTMLAnchorElement>("ul a[data-key]").forEach(a => {
			const href = a.getAttribute("href") || "";
			const active = href.startsWith("#")
				? location.hash === href
				: location.pathname === href;
			a.classList.toggle("active", active);
			if (active) a.setAttribute("aria-current", "page");
			else a.removeAttribute("aria-current");
		});
	}
}

export function userNavItems(): NavItem[] {
	return [
		{
			href: "#/upload",
			key: "Upload Files",
		},
		{
			href: "#/mails",
			key: "View Your Mails",
		},
		{
			href: "#/public",
			key: "View Public Mails",
		},
	];
}

export function adminNavItems(): NavItem[] {
	return [
		{
			href: "#/dashboard",
			key: "Dashboard",
		},
		{
			href: "#/subjects",
			key: "Subjects",
		},
		{
			href: "#/software",
			key: "Software",
		},
		{
			href: "/",
			key: "User app",
		},
	];
}
