import { cookies } from "./cookies";

if (!cookies.token) {
    window.location.href = `/page/login?next=${window.location.pathname}`;
}