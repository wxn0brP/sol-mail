import { _confirm } from "_popup";
import Cookies from "js-cookie";

(window as any).logout = async function () {
    const conf = await _confirm(t("Are you sure you want to logout") + "?");
    if (!conf) return;
    await fetch("/auth/logout", { method: "POST" });
    localStorage.clear();
    Cookies.remove("token", { path: "/" });
    window.location.href = "/page/login";
}