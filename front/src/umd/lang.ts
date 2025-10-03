function initTranslationsTags() {
    document.querySelectorAll("[translate]").forEach(el => {
        const key = el.getAttribute("translate");
        if (!key)
            el.setAttribute("translate", el.innerHTML);
    });
}

let loadedLang = localStorage.getItem("lang") || navigator.language?.split("-")?.[0] || "en";
let translations: Record<string, string> = {};
let titleString = qs("title").innerHTML.split("|")[1].trim();

function setTranslations(t: Record<string, string>) {
    translations = t;
}

function t(key: string): string {
    return translations[key] || key;
}

async function loadTranslations(lang: string) {
    const translations = await fetch("/app/lang/" + lang + ".json").then(res => res.json()).catch(() => ({}));
    setTranslations(translations);
    loadedLang = lang;
}

async function setLang(lang: string) {
    document.documentElement.lang = lang;
    if (loadedLang !== lang) await loadTranslations(lang);
    document.querySelectorAll("[translate]").forEach(el => {
        el.innerHTML = t(el.getAttribute("translate") || "");
    });
    qs("title").textContent = "Sol Mail | " + t(titleString);
}

initTranslationsTags();
loadTranslations(loadedLang).then(() => {
    setLang(loadedLang);
});

(window as any).setLang = setLang;
(window as any).t = t;