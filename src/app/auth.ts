import { RouteHandler, Router } from "@wxn0brp/falcon-frame";
import { jwtVerify } from "jose";
import { registerHandler } from "./register";
import { loginHandler } from "./login";
import { setToken } from "../utils/token";
import { AnotherCache } from "@wxn0brp/ac";
import { User } from "../types/auth";
import { db } from "../db";
import { cleanToken, Token } from "../utils/cleanToken";
const router = new Router();

export const cache = new AnotherCache<Pick<User, "name" | "_id">>();
export const inDbCache = new AnotherCache<Token>({
    ttl: 30 * 1000 // 30 s
});

router.post("/logout", async (req) => {
    if (!req.cookies.token) return { msg: "Error" };
    await db.master.removeOne("token", { _id: req.cookies.token });
    return { msg: "Logout successful" };
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
        }) as any;

        const { exp } = await setToken({ name: payload.name, _id: payload._id });

        return res.json({ msg: "Token refreshed", expiresAt: exp.getTime() });
    } catch (error) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }
});

const authMiddleware: RouteHandler = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }

    if (!inDbCache.has(token)) {
        await cleanToken();
        const inDbToken = await db.master.findOne<Token>("token", { _id: token });
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
        }) as any;
        req.user = {
            name: payload.name,
            _id: payload._id
        };

        next();
    } catch (error) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }
};

router.post("/login", loginHandler);
router.post("/register", registerHandler);

export { authMiddleware, router as authRouter };
