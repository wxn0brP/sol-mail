(window as any).logout = async function () {
    const conf = confirm("Are you sure you want to logout?");
    if (!conf) return;
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/page/login";
}