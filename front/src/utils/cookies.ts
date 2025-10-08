import Cookies from "js-cookie";

export const cookies = Cookies.get() as Record<string, string>;