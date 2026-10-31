import { t } from "#/shared/i18n";
import { cells } from "#/shared/state";
import { UiView } from "@wxn0brp/flanker-ui";
import type { AdminMail } from "#/shared/types";

export class NotificationsView extends UiView {
	constructor() {
		super();
		this.root = "#notifications-bar";
	}

	mounted() {
		this.paint();
		cells.notifications.subscribe(() => this.paint());
	}

	private paint() {
		this.element.innerHTML = this.markup();
		this.bind();
	}

	private markup() {
		const notifications = cells.notifications.get();
		if (!notifications.length) return "";

		return (
			<article id="mail-notification">
				<span>{t("New Mails")}</span>:
				<ul>
					{notifications.map((mail, index) => (
						<li>
							<button type="button" data-index={index}>
								<b>{mail.user}</b> - <b>{mail.name}</b>
							</button>
						</li>
					))}
				</ul>
			</article>
		);
	}

	private bind() {
		this.element
			.querySelectorAll<HTMLButtonElement>("li button")
			.forEach(button => {
				button.addEventListener("click", () => {
					const index = Number(button.dataset.index);
					const notifications = cells.notifications.get();
					const mail = notifications[index] as AdminMail | undefined;
					cells.notifications.set(
						notifications.filter((_, itemIndex) => itemIndex !== index),
					);
					if (mail) cells.search.set(`user:${mail.user} name:${mail.name}`);
					location.hash = "#/dashboard";
				});
			});
	}
}
