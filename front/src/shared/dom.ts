export function qs<T extends Element = HTMLElement>(
	selector: string,
	parent: ParentNode = document,
): T | null {
	return parent.querySelector<T>(selector);
}

export function byId<T extends HTMLElement = HTMLElement>(
	id: string,
): T | null {
	return document.getElementById(id) as T | null;
}
