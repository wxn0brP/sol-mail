import { select } from "_popup";
import Cookies from "js-cookie";

qs("#change-lang").addEventListener("click", async () => {
    const langsRaw = await fetch("/app/lang.json").then(res => res.json()).catch(() => ({})) as Record<string, string>;
    const langs = Object.entries(langsRaw).map(([lang, name]) => ({ value: lang, label: name }));
    const lang = await select(t("Select your language"), langs, localStorage.getItem("lang") || navigator.language?.split("-")?.[0] || "en");
    setLang(lang);
});

(window as any).setLocalLang = (lang: string) => {
    Cookies.set("lang", lang, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        path: "/"
    });
    localStorage.setItem("lang", lang);
}