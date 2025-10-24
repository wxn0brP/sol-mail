import { _select } from "_popup";

let opened = false;

qs("#change-lang").addEventListener("click", async () => {
    if (opened) return;
    opened = true;
    const langsRaw = await fetch("/app/lang.json").then(res => res.json()).catch(() => ({})) as Record<string, string>;
    const langs = Object.entries(langsRaw).map(([lang, name]) => ({ value: lang, label: name }));
    const lang = await _select(t("Select your language"), langs, localStorage.getItem("lang") || navigator.language?.split("-")?.[0] || "en");
    setLang(lang);
    opened = false;
});

(window as any).setLocalLang = (lang: string) => {
    const maxAge = 50 * 365.25 * 24 * 60 * 60; // 50 years
    document.cookie = `lang=${lang}; max-age=${maxAge}; path=/`;
    localStorage.setItem("lang", lang);
}