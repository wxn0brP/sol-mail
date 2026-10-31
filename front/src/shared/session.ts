import { store } from "./state";
import type { LoginResult } from "./types";

const TOKEN_KEY = "token";
const EXPIRES_KEY = "tokenExpiresAt";
const NAME_KEY = "name";
const ADMIN_KEY = "admin";

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

export function getExpiresAt() {
	return +localStorage.getItem(EXPIRES_KEY)! || 0;
}

export function jwtExpiry(token: string) {
	const part = token.split(".")[1];
	if (!part) return 0;

	try {
		const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
		const padded = normalized.padEnd(
			normalized.length + ((4 - (normalized.length % 4)) % 4),
			"=",
		);
		const payload = JSON.parse(atob(padded));
		return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
	} catch {
		return 0;
	}
}

function cookieToken() {
	const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
	return match?.[1] || "";
}

function writeCookie(token: string, expiresAt: number) {
	document.cookie = `token=${token}; path=/; SameSite=Lax; expires=${new Date(expiresAt).toUTCString()}`;
}

function clearCookie() {
	document.cookie = "token=; path=/; SameSite=Lax; max-age=0";
}

export function hasValidToken() {
	const now = Date.now();
	const cookie = cookieToken();

	if (cookie) {
		const expiresAt = jwtExpiry(cookie);
		if (expiresAt > now) return true;
		clearCookie();
		return false;
	}

	const token = getToken();
	if (!token) return false;

	const expiresAt = jwtExpiry(token);
	if (expiresAt <= now) {
		clearSession();
		return false;
	}

	writeCookie(token, expiresAt);
	return true;
}

export function saveSession(data: LoginResult) {
	localStorage.setItem(EXPIRES_KEY, String(data.expiresAt));
	localStorage.setItem(NAME_KEY, data.name);
	localStorage.setItem(TOKEN_KEY, data.token);
	localStorage.setItem(ADMIN_KEY, data.admin ? "1" : "0");
	writeCookie(
		data.token,
		data.expiresAt || jwtExpiry(data.token) || Date.now() + 3_600_000,
	);
	store.userName.set(data.name);
	store.admin.set(data.admin);
	store.loggedIn.set(true);
}

export function clearSession() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(EXPIRES_KEY);
	localStorage.removeItem(NAME_KEY);
	localStorage.removeItem(ADMIN_KEY);
	clearCookie();
	store.userName.set("");
	store.admin.set(false);
	store.loggedIn.set(false);
}

export function redirectToLogin(next = location.hash.slice(1) || "/") {
	if (location.hash.startsWith("#/login")) return;
	location.hash = `#/login?next=${encodeURIComponent(next)}`;
}
