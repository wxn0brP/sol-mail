import "#/styles/global.scss";
import "#/styles/mails.scss";
import { startTokenRefresh } from "#/shared/auth";
import { initI18n } from "#/shared/i18n";
import { Router } from "#/shared/router";
import { LoginView } from "#/shared/ui/login";
import { Nav, userNavItems } from "#/shared/ui/nav";
import { MailsView } from "./views/mails";
import { UploadView } from "./views/upload";

await initI18n();

startTokenRefresh();
new Nav(userNavItems).mount();

const router = new Router(
	{
		"/login": {
			create: () => new LoginView(),
			guard: "guest",
			titleKey: "Login",
		},
		"/upload": {
			create: () => new UploadView(),
			guard: "auth",
			titleKey: "File Upload",
		},
		"/mails": {
			create: () => new MailsView(false),
			guard: "auth",
			titleKey: "Mails",
		},
		"/public": {
			create: () => new MailsView(true),
			guard: "auth",
			titleKey: "Public Mails",
		},
	},
	"/upload",
);

router.start();
