import { cookies } from "../utils/cookies";
import { checkTokenRefresh } from "../utils/tokenRefresh";
import "./login.scss";

checkTokenRefresh(false);
const loginForm = qs<HTMLFormElement>("form");
const errorMessage = qs("#error-message");

function next() {
    const urlParams = new URLSearchParams(window.location.search);
    const next = urlParams.get("next") || "page/upload";
    window.location.href = window.location.origin + ("/" + next).replace("//", "/");
}

if (cookies.token) {
    const conf = confirm("You are already logged in. Do you want to stay logged in?");
    if (conf) next();
} else {
    qs("nav").style.opacity = "0";
    qs("nav ul").style.pointerEvents = "none";
}

loginForm.on("submit", async (event) => {
    event.preventDefault();
    const fd = new FormData(loginForm);
    const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(Object.fromEntries(fd))
    });

    const data = await res.json();

    if (data.err) {
        errorMessage.innerHTML = data.msg;
    } else {
        localStorage.setItem("tokenExpiresAt", data.expiresAt);
        next();
    }
});