import { byId } from "../dom";
import { t } from "../i18n";
import { trapDialogFocus } from "./dialog";

let popupId = 0;

function popupContainer() {
	return byId("popup-container") ?? document.body;
}

function createDialog(message: string) {
	const wrapper = document.createElement("div");
	wrapper.className = "popup";

	const dialog = document.createElement("div");
	dialog.className = "popup-dialog";
	dialog.setAttribute("role", "dialog");
	dialog.setAttribute("aria-modal", "true");

	const title = document.createElement("p");
	title.id = `popup-title-${++popupId}`;
	title.textContent = message;
	dialog.setAttribute("aria-labelledby", title.id);
	dialog.appendChild(title);
	wrapper.appendChild(dialog);

	return {
		wrapper,
		dialog,
	};
}

function createButton(label: string, kind?: "safe" | "danger") {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = label;
	if (kind) button.className = kind;
	return button;
}

function mountDialog(wrapper: HTMLElement) {
	const previous = document.activeElement as HTMLElement | null;
	popupContainer().appendChild(wrapper);
	return {
		previous,
		close() {
			wrapper.remove();
			previous?.focus();
		},
	};
}

export function _confirm(message: string, yesFirst = false): Promise<boolean> {
	const { wrapper, dialog } = createDialog(message);
	const actions = document.createElement("div");
	actions.className = "popup-actions";

	const cancel = createButton(t("no"), "danger");
	const confirm = createButton(t("yes"), "safe");
	const buttons = yesFirst
		? [
				cancel,
				confirm,
			]
		: [
				confirm,
				cancel,
			];
	for (const button of buttons) actions.appendChild(button);
	dialog.appendChild(actions);

	const { close } = mountDialog(wrapper);

	return new Promise<boolean>(resolve => {
		let unlock = () => {};
		const finish = (value: boolean) => {
			unlock();
			close();
			resolve(value);
		};

		unlock = trapDialogFocus(dialog, () => finish(false));
		confirm.addEventListener("click", () => finish(true));
		cancel.addEventListener("click", () => finish(false));
		confirm.focus();
	});
}

export function _alert(message: string): Promise<void> {
	const { wrapper, dialog } = createDialog(message);
	const confirm = createButton(t("OK"));
	dialog.appendChild(confirm);

	const { close } = mountDialog(wrapper);

	return new Promise<void>(resolve => {
		let unlock = () => {};
		const finish = () => {
			unlock();
			close();
			resolve();
		};

		unlock = trapDialogFocus(dialog, finish);
		confirm.addEventListener("click", finish);
		confirm.focus();
	});
}

export function _select<T>(
	message: string,
	options: {
		value: T;
		label: string;
	}[],
	defaultValue?: T,
): Promise<T | null> {
	const { wrapper, dialog } = createDialog(message);
	const select = document.createElement("select");

	for (const option of options) {
		const optionElement = document.createElement("option");
		optionElement.value = String(option.value);
		optionElement.textContent = option.label;
		select.appendChild(optionElement);
	}

	if (defaultValue !== undefined) select.value = String(defaultValue);

	const confirm = createButton(t("OK"));
	dialog.append(select, confirm);

	const { close } = mountDialog(wrapper);

	return new Promise<T | null>(resolve => {
		let unlock = () => {};
		const finish = (value: T | null) => {
			unlock();
			close();
			resolve(value);
		};

		unlock = trapDialogFocus(dialog, () => finish(null));
		confirm.addEventListener("click", () => finish(select.value as T));
		select.focus();
	});
}
