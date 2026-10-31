import { api } from "#/shared/api";
import { cells } from "#/shared/state";
import type { AdminMail, User } from "#/shared/types";

export function startSse() {
	const event = new EventSource(api.admin.sseUrl);

	event.onmessage = event => {
		const mail = JSON.parse(event.data) as AdminMail;

		const users = cells.adminData.get().map(user => ({
			name: user.name,
			mails: [
				...user.mails,
			],
		})) as User[];

		let user = users.find(user => user.name === mail.user);
		if (!user) {
			user = {
				name: mail.user,
				mails: [],
			};
			users.push(user);
		}
		user.mails.unshift(mail);
		cells.adminData.set(users);
		cells.notifications.set([
			mail,
			...cells.notifications.get(),
		]);
	};

	window.addEventListener("beforeunload", () => event.close());

	return event;
}
