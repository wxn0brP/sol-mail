export const searchInput = qi("#search");

export function search() {
    const openUserDetails = new Set<HTMLElement>();
    document.querySelectorAll<HTMLElement>(".user[open]").forEach(userElement => {
        openUserDetails.add(userElement);
    });

    const searchTerm = searchInput.value.toLowerCase().trim();
    const filters = {
        user: [] as string[],
        name: [] as string[],
        file: [] as string[],
        text: [] as string[],
    };

    const terms = searchTerm.split(/\s+/).filter(Boolean);
    terms.forEach(term => {
        const separatorIndex = term.indexOf(":");

        if (separatorIndex > 0 && separatorIndex < term.length - 1) {
            const key = term.substring(0, separatorIndex);
            const value = term.substring(separatorIndex + 1);
            switch (key) {
                case "user":
                    filters.user.push(value);
                    break;
                case "name":
                    filters.name.push(value);
                    break;
                case "file":
                    filters.file.push(value);
                    break;
                default:
                    filters.text.push(term);
                    break;
            }
        } else {
            filters.text.push(term);
        }
    });

    const allUserElements = document.querySelectorAll<HTMLElement>(".user");

    allUserElements.forEach(userElement => {
        const userName = userElement.querySelector("summary")?.textContent?.toLowerCase() || "";
        const mailElements = userElement.querySelectorAll<HTMLElement>(".mails-container > ul > li");
        let userHasVisibleMails = false;

        mailElements.forEach(mailElement => {
            const mailName = mailElement.querySelector("h3")?.textContent?.toLowerCase() || "";
            const fileLinks = mailElement.querySelectorAll<HTMLAnchorElement>(".files-container a");
            const fileNames = Array.from(fileLinks).map(f => f.dataset.filename?.toLowerCase() || "");

            // mask (user:$user eg)
            const userMatch = filters.user.length === 0 || filters.user.some(term => userName.includes(term));
            const nameMatch = filters.name.length === 0 || filters.name.some(term => mailName.includes(term));
            const fileMatch = filters.file.length === 0 || filters.file.some(term => fileNames.some(fn => fn.includes(term)));

            // normal text
            const allTextContent = [userName, mailName, ...fileNames];
            const textMatch = filters.text.length === 0 || filters.text.every(term => allTextContent.some(content => content.includes(term)));

            if (userMatch && nameMatch && fileMatch && textMatch) {
                (mailElement as HTMLElement).style.display = "";
                userHasVisibleMails = true;
            } else {
                (mailElement as HTMLElement).style.display = "none";
            }
        });

        if (userHasVisibleMails) {
            userElement.style.display = "";
            if (openUserDetails.has(userElement) || searchTerm)
                userElement.setAttribute("open", "");
        } else {
            userElement.style.display = "none";
            userElement.removeAttribute("open");
        }
    });
}

searchInput.addEventListener("input", () => search());