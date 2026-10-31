export interface Mail {
	name: string;
	files: string[];
	txt: string;
	_id: string;
}

export interface User {
	name: string;
	mails: Mail[];
}

export interface GroupedByMail {
	name: string;
	users: {
		name: string;
		mail: Mail;
	}[];
}

export type GroupBy = "user" | "mailName";

export interface ApiError {
	err: true;
	msg: string;
}

export interface LoginResult {
	err: false;
	msg: string;
	expiresAt: number;
	token: string;
	name: string;
	admin: boolean;
}

export interface VersionInfo {
	success: boolean;
	isCurrent: boolean;
}

export interface ClientRelease {
	updated_at: string;
}

export function isError(value: unknown): value is ApiError {
	return (
		!!value && typeof value === "object" && (value as ApiError).err === true
	);
}

export interface AdminMail extends Mail {
	user: string;
}
