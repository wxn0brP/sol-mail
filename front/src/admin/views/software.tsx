import { api } from "#/shared/api";
import { qs } from "#/shared/dom";
import { t } from "#/shared/i18n";
import { getMailDateText } from "#/shared/mail/mailUtils";
import { isError, type VersionInfo } from "#/shared/types";
import { _alert } from "#/shared/ui/popup";
import { UiView } from "@wxn0brp/flanker-ui";

const statusColors = {
	green: "var(--green)",
	orange: "orange",
	red: "var(--red-text)",
	error: "var(--red-text)",
};

export class SoftwareView extends UiView {
	private statusText = t("Checking") + "...";
	private statusColor = "";
	private statusClickable = false;
	private clientText = t("Checking") + "...";
	private clientTitle = "";
	private clientColor = "";
	private updating = false;

	mounted() {
		this.element.setAttribute("aria-live", "polite");
		this.paint();
		this.checkVersion();
		this.checkClient();
	}

	onUpdate() {
		this.checkVersion();
		this.checkClient();
	}

	private paint() {
		this.element.innerHTML = this.markup();
		this.bind();
	}

	private markup() {
		return (
			<div id="software-view">
				<h1>{t("Software")}</h1>
				<article id="software-notification">
					<p>
						<span>{t("Version Status")}</span>:{" "}
						{this.statusClickable ? (
							<button
								id="version-status"
								type="button"
								class="status-update"
								title={t("Click to update")}
								style={this.statusColor ? `color: ${this.statusColor}` : ""}>
								{this.statusText}
							</button>
						) : (
							<span
								id="version-status"
								style={this.statusColor ? `color: ${this.statusColor}` : ""}>
								{this.statusText}
							</span>
						)}
					</p>
					<p>
						<span>{t("Client latest update")}</span>:{" "}
						<span
							id="client-latest-update"
							title={this.clientTitle}
							style={this.clientColor ? `color: ${this.clientColor}` : ""}>
							{this.clientText}
						</span>
					</p>
				</article>
			</div>
		);
	}

	private bind() {
		if (!this.statusClickable) return;
		qs("#version-status", this.element)?.addEventListener("click", () =>
			this.runUpdate(),
		);
	}

	private async checkVersion() {
		const result = await api.admin.version();
		if (isError(result)) {
			this.setStatus(statusColors.error, "Connection error");
			return;
		}

		const version = result as VersionInfo;
		if (!version.success) {
			this.setStatus(statusColors.red, "Checking Error");
			return;
		}

		if (version.isCurrent) {
			this.setStatus(statusColors.green, "Up to date");
			return;
		}

		this.statusClickable = true;
		this.setStatus(statusColors.orange, "Update available");
	}

	private setStatus(color: string, text: string) {
		this.statusColor = color;
		this.statusText = t(text);
		this.paint();
	}

	private async checkClient() {
		try {
			const release = await api.client.latestRelease();
			const date = new Date(release.updated_at);
			const { fullDate, shortDate } = getMailDateText(date);
			this.clientText = shortDate;
			this.clientTitle = fullDate;
			this.clientColor = statusColors.green;
		} catch (error) {
			console.error("Error fetching client version info:", error);
			this.clientText = "Error";
			this.clientColor = statusColors.error;
		}
		this.paint();
	}

	private async runUpdate() {
		if (this.updating) return;
		this.updating = true;
		this.statusText = t("Updating");
		this.statusColor = statusColors.orange;
		this.paint();

		const loading = document.createElement("span");
		qs("#version-status", this.element)?.appendChild(loading);
		let i = 0;
		const timer = setInterval(() => {
			loading.textContent = ".".repeat(i++ % 4);
		}, 300);

		const result = await api.admin.autoUpdate();
		clearInterval(timer);

		if (result && "err" in result && result.err) {
			await _alert(t(result.msg));
			this.statusClickable = true;
			this.setStatus(statusColors.orange, "Update available");
			this.updating = false;
			return;
		}

		await _alert(t("Please start server again") + ".");
		location.reload();
	}
}
