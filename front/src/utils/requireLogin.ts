if (!document.cookie.includes("token=")) {
    const localToken = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (localToken && expiresAt && +expiresAt > Date.now()) {
        document.cookie = `token=${localToken}; path=/; SameSite=Lax; expires=${new Date(expiresAt).toUTCString()}`;
    } else {
        window.location.href = `/page/login?next=${window.location.pathname}`;
    }
}