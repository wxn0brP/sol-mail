import { Router } from "@wxn0brp/falcon-frame";
import { jwtVerify } from "jose";
import { registerHandler } from "./register.js";
import { loginHandler } from "./login.js";
import { setToken } from "../utils/token.js";
import { AnotherCache } from "@wxn0brp/ac";
import { db } from "../db/index.js";
import { cleanToken } from "../utils/cleanToken.js";
const router = new Router();
export const cache = new AnotherCache();
export const inDbCache = new AnotherCache({
    ttl: 30 * 1000 // 30 s
});
router.post("/logout", async (req, res) => {
    res.setHeader("Set-Cookie", "token=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    await db.master.removeOne("token", { _id: req.cookies.token });
    res.status(200);
    return res.json({ msg: "Logout successful" });
});
router.post("/refresh", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
        const { payload } = await jwtVerify(token, secret, {
            issuer: "urn:example:issuer",
            audience: "urn:example:audience"
        });
        const { exp } = await setToken({ name: payload.name, _id: payload._id }, res);
        return res.json({ msg: "Token refreshed", expiresAt: exp.getTime() });
    }
    catch (error) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }
});
const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }
    if (!inDbCache.has(token)) {
        await cleanToken();
        const inDbToken = await db.master.findOne("token", { _id: token });
        if (!inDbToken) {
            res.status(401);
            return res.json({ msg: "Unauthorized" });
        }
        if (inDbToken.exp < Date.now()) {
            res.status(401);
            await db.master.removeOne("token", { _id: token });
            return res.json({ msg: "Unauthorized" });
        }
        inDbCache.set(token, inDbToken);
    }
    if (cache.has(token)) {
        req.user = cache.get(token);
        return next();
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
        const { payload } = await jwtVerify(token, secret, {
            issuer: "urn:example:issuer",
            audience: "urn:example:audience"
        });
        req.user = {
            name: payload.name,
            _id: payload._id
        };
        next();
    }
    catch (error) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }
};
router.post("/login", loginHandler);
router.post("/register", registerHandler);
export { authMiddleware, router as authRouter };
