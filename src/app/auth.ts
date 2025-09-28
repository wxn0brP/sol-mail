import { RouteHandler, Router } from "@wxn0brp/falcon-frame";
import { jwtVerify } from "jose";
import { registerHandler } from "./register";
import { loginHandler } from "./login";
const router = new Router();

router.post("/logout", async (req, res) => {
    res.setHeader(
        "Set-Cookie",
        "token=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );

    res.status(200);
    return res.json({ message: "Logout successful" });
});

const authMiddleware: RouteHandler = async (req, res, next) => {
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
