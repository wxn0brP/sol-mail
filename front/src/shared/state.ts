import { ReactiveCell, createStore } from "@wxn0brp/flanker-ui";
import type { AdminMail, User } from "./types";

export const store = createStore({
	lang: "en",
	loggedIn: false,
	userName: localStorage.getItem("name") ?? "",
	admin: localStorage.getItem("admin") === "1",
});

export const cells = {
	adminData: new ReactiveCell<User[]>([]),
	subjects: new ReactiveCell<string[]>([]),
	notifications: new ReactiveCell<AdminMail[]>([]),
	search: new ReactiveCell<string>(""),
};
