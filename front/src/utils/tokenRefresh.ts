let tokenExpiresAt: number = +localStorage.getItem("tokenExpiresAt") || 0;

export async function refreshToken(next = true) {
    const res = await fetch("/auth/refresh", { method: "POST" });
    if (res.ok) {
        const { expiresAt } = await res.json();
        localStorage.setItem("tokenExpiresAt", expiresAt);
        tokenExpiresAt = expiresAt;
    }
    else if (next) window.location.href = "/page/login?next=" + window.location.pathname;
}

export function checkTokenRefresh(next = true) {
    if (!tokenExpiresAt) return
    const now = Date.now();
    const eightyPercentOfLifetime = tokenExpiresAt - (tokenExpiresAt - now) * 0.2;
    if (now > eightyPercentOfLifetime) {
        refreshToken(next);
    }
}