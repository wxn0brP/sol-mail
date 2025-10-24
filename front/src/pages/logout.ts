import { _confirm } from "_popup";

(window as any).logout = async function () {
    const conf = await _confirm(t("Are you sure you want to logout") + "?");
    if (!conf) return;
    await fetch("/auth/logout", { method: "POST" });
    localStorage.clear();
    document.cookie = "token=; path=/; SameSite=Lax; max-age=0";
    window.location.href = "/page/login";
}