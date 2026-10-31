import { clearSession, redirectToLogin } from "./session";
import type {
	ApiError,
	ClientRelease,
	LoginResult,
	Mail,
	User,
	VersionInfo,
} from "./types";

export async function request<T>(
	url: string,
	init?: RequestInit,
): Promise<T | ApiError> {
	let res: Response;
	try {
		res = await fetch(url, init);
	} catch {
		return {
			err: true,
			msg: "Could not connect to the server",
		};
	}

	if (res.status === 401) {
		clearSession();
		redirectToLogin();
		return {
			err: true,
			msg: "Unauthorized",
		};
	}

	if (!res.ok) {
		return {
			err: true,
			msg: "Request failed",
		};
	}

	return res.json().catch(() => ({
		err: true,
		msg: "Invalid response",
	}));
}

function jsonInit(body: unknown): RequestInit {
	return {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	};
}

export const api = {
	auth: {
		login: (name: string, pass: string) =>
			request<LoginResult>(
				"/auth/login",
				jsonInit({
					name,
					pass,
				}),
			),
		register: (name: string, pass: string) =>
			request<{
				err: boolean;
				msg: string;
			}>(
				"/auth/register",
				jsonInit({
					name,
					pass,
				}),
			),
		refresh: () =>
			request<{
				expiresAt: number;
			}>("/auth/refresh", {
				method: "POST",
			}),
		logout: () =>
			request<{
				msg: string;
			}>("/auth/logout", {
				method: "POST",
			}),
	},
	files: {
		mails: (isPublic = false) =>
			request<Mail[]>("/api/files/mails" + (isPublic ? "?public=true" : "")),
		upload: (mailName: string, body: string, files: File[]) => {
			const formData = new FormData();
			formData.append("mailName", mailName);
			if (body) formData.append("body", body);
			for (const file of files) formData.append("filefield", file);
			return request<{
				err?: boolean;
				msg?: string;
			}>(`/api/files/${encodeURIComponent(mailName)}`, {
				method: "POST",
				body: formData,
			});
		},
	},
	admin: {
		userData: () => request<User[]>("/api/admin/user-data"),
		version: () => request<VersionInfo>("/api/admin/version"),
		autoUpdate: () =>
			request<{
				err?: boolean;
				msg?: string;
			}>("/api/admin/auto-update"),
		subjectAdd: (subject: string) =>
			request<{
				err?: boolean;
				msg?: string;
			}>(
				"/api/admin/subject",
				jsonInit({
					subject,
				}),
			),
		subjectRemove: (subject: string) =>
			request<{
				err?: boolean;
				msg?: string;
			}>("/api/admin/subject", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					subject,
				}),
			}),
		sseUrl: "/api/admin/sse",
	},
	data: {
		subjects: () => request<string[]>("/api/data/subjects"),
	},
	client: {
		latestRelease: () =>
			fetch(
				"https://api.github.com/repos/wxn0brP/sol-mail-client/releases/latest",
			).then(res => res.json() as Promise<ClientRelease>),
	},
};
