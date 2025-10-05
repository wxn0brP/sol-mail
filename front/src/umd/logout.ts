(window as any).logout = async function () {
    const conf = confirm(t("Are you sure you want to logout?"));
    if (!conf) return;
    await fetch("/auth/logout", { method: "POST" });
    localStorage.clear();
    document.cookie = "token=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    window.location.href = "/page/login";
}