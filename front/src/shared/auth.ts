import { api } from "./api";
import {
	clearSession,
	getExpiresAt,
	getToken,
	hasValidToken,
	redirectToLogin,
	saveSession,
} from "./session";
import { store } from "./state";
import type { ApiError, LoginResult } from "./types";

let refreshTimer: ReturnType<typeof setInterval> | null = null;

export function isLoggedIn() {
	const loggedIn = hasValidToken();
	store.loggedIn.set(loggedIn);
	return loggedIn;
}

export function isAdmin() {
	return store.admin.get();
}

export async function login(
	name: string,
	pass: string,
): Promise<LoginResult | ApiError> {
	const result = await api.auth.login(name, pass);
	if (result && !("err" in result && result.err === true)) {
		const data = result as LoginResult;
		data.expiresAt ||= 0;
		saveSession(data);
		startTokenRefresh();
	}
	return result as LoginResult | ApiError;
}

export async function register(name: string, pass: string) {
	return api.auth.register(name, pass);
}

export async function logout() {
	await api.auth.logout();
	clearSession();
}

export function redirectAfterLogin(next?: string | null) {
	location.hash = `#${next && next.startsWith("/") ? next : "/upload"}`;
}

async function refreshToken() {
	const result = await api.auth.refresh();
	if ("err" in result && result.err) {
		redirectToLogin();
		return;
	}

	const expiresAt = (
		result as {
			expiresAt: number;
		}
	).expiresAt;
	localStorage.setItem("tokenExpiresAt", String(expiresAt));
	const token = getToken();
	if (token) {
		document.cookie = `token=${token}; path=/; SameSite=Lax; expires=${new Date(expiresAt).toUTCString()}`;
	}
}

function shouldRefresh() {
	const expiresAt = getExpiresAt();
	if (!expiresAt) return false;
	const now = Date.now();
	return now > expiresAt - (expiresAt - now) * 0.2;
}

export function startTokenRefresh() {
	if (refreshTimer) return;
	refreshTimer = setInterval(() => {
		if (isLoggedIn() && shouldRefresh()) refreshToken();
	}, 30_000);
}
