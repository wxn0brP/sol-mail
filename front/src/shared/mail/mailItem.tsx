import { t } from "../i18n";
import type { Mail } from "../types";
import { displayFiles } from "./displayFiles";
import { getMailBody, getMailDateElement } from "./mailUtils";

export function mailItem(mail: Mail, apiPath: string, user?: string) {
	return (
		<li>
			<h3>{mail.name}</h3>
			{getMailDateElement(mail._id)}
			{getMailBody(mail.txt)}
			<button
				type="button"
				class="show"
				data-id={mail._id}
				aria-expanded="false"
				aria-controls={`files-${mail._id}`}>
				{t("View Files")}
			</button>
			<div
				class="files-container"
				id={`files-${mail._id}`}
				data-id={`files-${mail._id}`}>
				{displayFiles({
					name: mail.name,
					files: mail.files,
					apiPath,
					user,
				})}
			</div>
		</li>
	);
}
