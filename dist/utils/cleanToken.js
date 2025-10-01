import { db } from "../db/index.js";
export async function cleanToken() {
    const tokens = await db.master.find("token");
    for (const token of tokens) {
        if (token.exp < Date.now()) {
            await db.master.removeOne("token", { _id: token._id });
        }
    }
}
setInterval(cleanToken, 10 * 60 * 1000);
cleanToken();
