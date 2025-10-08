import { checkTokenRefresh } from "_tokenRefresh";
import Cookies from "js-cookie";
import "./login.scss";

checkTokenRefresh(false);
const loginForm = qs<HTMLFormElement>("form");
const errorMessage = qs("#error-message");
const urlParams = new URLSearchParams(window.location.search);
const isRegister = urlParams.has("register");

function next() {
    const next = urlParams.get("next") || "page/upload";
    window.location.href = window.location.origin + ("/" + next).replace("//", "/");
}

qs("nav").style.opacity = "0";
qs("nav ul").style.pointerEvents = "none";

loginForm.on("submit", async (event) => {
    event.preventDefault();
    const fd = new FormData(loginForm);
    const res = await fetch("/auth/" + (isRegister ? "register" : "login"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(Object.fromEntries(fd))
    });

    const data = await res.json();

    if (data.err) {
        errorMessage.innerHTML = t(data.msg);
        return
    }

    if (isRegister) {
        location.href = "/page/login";
    } else {
        localStorage.setItem("tokenExpiresAt", data.expiresAt);
        localStorage.setItem("name", data.name);
        setTimeout(() => {
            if (!Cookies.get("token") || Cookies.get("token")!.length < 20)
                Cookies.set("token", data.token, { 
                    expires: new Date(data.expiresAt), 
                    path: "/" 
                });
            next();
        });
    }
});

if (isRegister) {
    qs("h1").html(t("Register")).attrib("translate", "Register");
    qs("button").html(t("Register")).attrib("translate", "Register");
    setTimeout(() => qs("title").textContent = "Sol Mail | " + t("Register"), 1000);
}