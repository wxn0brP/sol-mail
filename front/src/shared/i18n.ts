import { store } from "./state";

let translations: Record<string, string> = {};

export function t(key: string): string {
	return translations[key] || key;
}

export function getLang() {
	return store.lang.get();
}

function saveLang(lang: string) {
	const maxAge = 50 * 365.25 * 24 * 60 * 60;
	document.cookie = `lang=${lang}; max-age=${maxAge}; path=/`;
	localStorage.setItem("lang", lang);
}

async function load(lang: string) {
	translations = await fetch(`/lang/${lang}.json`)
		.then(res => res.json())
		.catch(() => ({}));
	document.documentElement.lang = lang;
}

export function preferredLang() {
	return (
		localStorage.getItem("lang") || navigator.language?.split("-")?.[0] || "en"
	);
}

export async function initI18n() {
	const lang = preferredLang();
	await load(lang);
	store.lang.set(lang);
}

export async function setLang(lang: string) {
	saveLang(lang);
	await load(lang);
	store.lang.set(lang);
}

export async function availableLangs() {
	const langs = (await fetch("/lang.json")
		.then(res => res.json())
		.catch(() => ({}))) as Record<string, string>;
	return Object.entries(langs).map(([value, label]) => ({
		value,
		label,
	}));
}
