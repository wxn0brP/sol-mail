const focusableSelector =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function trapDialogFocus(dialog: HTMLElement, onEscape: () => void) {
	const keydown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			event.preventDefault();
			onEscape();
			return;
		}

		if (event.key !== "Tab") return;

		const focusable = Array.from(
			dialog.querySelectorAll<HTMLElement>(focusableSelector),
		).filter(element => !element.hasAttribute("disabled"));

		if (!focusable.length) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	document.addEventListener("keydown", keydown);
	return () => document.removeEventListener("keydown", keydown);
}
