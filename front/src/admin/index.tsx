import "#/styles/global.scss";
import "#/styles/mails.scss";
import "#/styles/admin.scss";
import { isLoggedIn, startTokenRefresh } from "#/shared/auth";
import { initI18n } from "#/shared/i18n";
import { Router } from "#/shared/router";
import { store } from "#/shared/state";
import { LoginView } from "#/shared/ui/login";
import { adminNavItems, Nav } from "#/shared/ui/nav";
import { startSse } from "./sse";
import { DashboardView } from "./views/dashboard";
import { NotificationsView } from "./views/notifications";
import { SoftwareView } from "./views/software";
import { SubjectsView } from "./views/subjects";

await initI18n();

startTokenRefresh();
new Nav(adminNavItems).mount();
new NotificationsView().mount();

let sseStarted = false;
function ensureSse() {
	if (sseStarted || !isLoggedIn()) return;
	sseStarted = true;
	startSse();
}
ensureSse();
store.loggedIn.subscribe(() => ensureSse());

const router = new Router(
	{
		"/login": {
			create: () => new LoginView("/dashboard"),
			guard: "guest",
			titleKey: "Login",
		},
		"/dashboard": {
			create: () => new DashboardView(),
			guard: "admin",
			titleKey: "Dashboard",
		},
		"/subjects": {
			create: () => new SubjectsView(),
			guard: "admin",
			titleKey: "Subjects",
		},
		"/software": {
			create: () => new SoftwareView(),
			guard: "admin",
			titleKey: "Software",
		},
	},
	"/dashboard",
);

router.start();
