import { api } from "#/shared/api";
import { t } from "#/shared/i18n";
import { bindMailList } from "#/shared/mail/displayFiles";
import { mailItem } from "#/shared/mail/mailItem";
import { sort } from "#/shared/mail/mailUtils";
import { isError, type Mail } from "#/shared/types";
import { UiView } from "@wxn0brp/flanker-ui";
import "#/styles/mails.scss";

export class MailsView extends UiView {
	private mails: Mail[] = [];
	private error = "";
	private loading = true;

	constructor(private isPublic = false) {
		super();
	}

	mounted() {
		this.load();
	}

	onUpdate() {
		this.load();
	}

	private async load() {
		this.loading = true;
		this.error = "";
		this.paint();

		const result = await api.files.mails(this.isPublic);
		if (isError(result)) {
			this.error = t(result.msg);
		} else {
			this.mails = sort(result as Mail[]);
		}
		this.loading = false;
		this.paint();
	}

	private paint() {
		this.element.innerHTML = this.markup();
		bindMailList(this.element);
	}

	private markup() {
		return (
			<div class="mails-container" id="mails-view">
				<h1>
					{t(this.isPublic ? "Public" : "Your")} {t("Mails")}
				</h1>
				{this.loading ? (
					<p class="status-message">{t("Loading your mails")}...</p>
				) : null}
				{this.error ? <p class="error-message">{this.error}</p> : null}
				{!this.loading && !this.error && this.mails.length === 0 ? (
					<div class="empty-state">
						<p>{t(this.isPublic ? "No public mails yet" : "No mails yet")}.</p>
						{this.isPublic ? null : (
							<p>
								<a href="#/upload">{t("Upload Files")}</a>
							</p>
						)}
					</div>
				) : null}
				{this.mails.length ? (
					<ul>
						{this.mails.map(mail =>
							mailItem(
								mail,
								"/api/files/files",
								this.isPublic ? "public" : undefined,
							),
						)}
					</ul>
				) : null}
			</div>
		);
	}
}
