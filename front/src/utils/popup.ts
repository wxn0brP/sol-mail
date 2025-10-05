const popupContainer = qs("#popup-container");

export async function confirm(message: string): Promise<boolean> {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
        <div class="popup">
            <p>${message}</p>
            <div style="display: flex; gap: 1rem;">
                <button class="confirm">${t("Yes")}</button>
                <button class="cancel">${t("No")}</button>
            </div>
        </div>
    `;

    const confirmButton = popup.qs(".confirm");
    const cancelButton = popup.qs(".cancel");
    const promise = new Promise<boolean>(resolve => {
        confirmButton.addEventListener("click", () => {
            resolve(true);
            popup.remove();
        });
        cancelButton.addEventListener("click", () => {
            resolve(false);
            popup.remove();
        });
    });

    function keydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            confirmButton.click();
            document.removeEventListener("keydown", keydown);
        } else if (e.key === "Escape") {
            cancelButton.click();
            document.removeEventListener("keydown", keydown);
        }
    }
    document.addEventListener("keydown", keydown);

    popupContainer.appendChild(popup);
    return promise;
}

export async function alert(message: string) {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
        <div class="popup">
            <p>${message}</p>
            <button class="confirm">${t("OK")}</button>
        </div>
    `;
    const confirmButton = popup.qs(".confirm");
    const promise = new Promise<void>(resolve => {
        confirmButton.addEventListener("click", () => {
            resolve();
            popup.remove();
        });
    });

    function keydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            confirmButton.click();
            document.removeEventListener("keydown", keydown);
        }
    }
    document.addEventListener("keydown", keydown);

    popupContainer.appendChild(popup);
    return promise;
}

export async function select<T>(message: string, options: { value: T; label: string }[], defaultValue?: T): Promise<T | null> {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
        <div class="popup">
            <p>${message}</p>
            <select></select>
            <button class="confirm">${t("OK")}</button>
        </div>
    `;
    const select = popup.qs<HTMLSelectElement>("select");
    const confirmButton = popup.qs(".confirm");
    const promise = new Promise<T | null>(resolve => {
        confirmButton.addEventListener("click", () => {
            resolve(select.value as any);
            popup.remove();
        });
    });
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value as any;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
    });

    if (defaultValue) {
        select.value = defaultValue as any;
    }

    function keydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            confirmButton.click();
            document.removeEventListener("keydown", keydown);
        }
    }
    document.addEventListener("keydown", keydown);

    popupContainer.appendChild(popup);
    return promise;
}