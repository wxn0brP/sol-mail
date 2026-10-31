import type { UiView } from "@wxn0brp/flanker-ui";
import { isAdmin, isLoggedIn } from "./auth";
import { qs } from "./dom";
import { t } from "./i18n";
import { redirectToLogin } from "./session";
import { store } from "./state";

export interface RouteDef {
	create: () => UiView;
	guard?: "auth" | "admin" | "guest";
	titleKey?: string;
}

interface Entry {
	el: HTMLElement;
	view: UiView;
}

export class Router {
	private root = qs("#app");
	private views = new Map<string, Entry>();
	private current?: Entry;
	private titleKey?: string;

	constructor(
		private routes: Record<string, RouteDef>,
		private fallback: string,
	) {}

	start() {
		window.addEventListener("hashchange", () => this.resolve());
		store.lang.subscribe(() => {
			this.current?.view.requestUpdate();
			this.setTitle();
		});
		this.resolve();
	}

	resolve() {
		const [path] = (location.hash.slice(1) || this.fallback).split("?");
		const route = this.routes[path];
		if (!route) {
			location.hash = `#${this.fallback}`;
			return;
		}

		const loggedIn = isLoggedIn();
		if (route.guard === "auth" && !loggedIn) return redirectToLogin(path);
		if (route.guard === "guest" && loggedIn) {
			location.hash = `#${this.fallback}`;
			return;
		}
		if (route.guard === "admin" && !(loggedIn && isAdmin())) {
			loggedIn ? (location.href = "/") : redirectToLogin(path);
			return;
		}

		let entry = this.views.get(path);
		if (!entry) {
			const el = document.createElement("section");
			el.style.display = "none";
			this.root.appendChild(el);

			const view = route.create();
			view.root = el;
			view.mount();
			entry = {
				el,
				view,
			};
			this.views.set(path, entry);
		} else {
			entry.view.requestUpdate();
		}

		if (this.current) this.current.el.style.display = "none";
		entry.el.style.display = "";
		this.current = entry;
		this.titleKey = route.titleKey;
		this.setTitle();
		if (!location.hash) history.replaceState(null, "", `#${this.fallback}`);
	}

	private setTitle() {
		document.title =
			"Sol Mail" + (this.titleKey ? ` | ${t(this.titleKey)}` : "");
	}
}
