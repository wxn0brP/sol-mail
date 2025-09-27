import { RouteHandler, Router } from "@wxn0brp/falcon-frame";
import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { db } from "../db";

interface User {
    _id: string;
    name: string;
    pass: string;
}

declare module "@wxn0brp/falcon-frame" {
    interface FFRequest {
        user?: {
            name: string;
            _id: string;
        };
    }
}

const router = new Router();

router.post("/login", async (req) => {
    try {
        const { name, pass } = req.body;

        if (!name || !pass) {
            return { status: 400, message: "Missing name or pass" };
        }

        const user = await db.master.findOne<User>("users", { name });

        if (!user) {
            return { status: 401, message: "Invalid credentials" };
        }

        const hashedPassword = createHash("sha256").update(pass).digest("hex");

        if (user.pass !== hashedPassword) {
            return { status: 401, message: "Invalid credentials" };
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const alg = "HS256";

        const jwt = await new SignJWT({ name: user.name, _id: user._id })
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setIssuer("urn:example:issuer")
            .setAudience("urn:example:audience")
            .setExpirationTime("2h")
            .sign(secret);

        return { token: jwt };
    } catch (error) {
        console.error(error);
        return { status: 500, message: "Internal Server Error" };
    }
});

router.post("/register", async (req) => {
    try {
        const { name, pass } = req.body;

        if (!name || !pass) {
            return { status: 400, message: "Missing name or pass" };
        }

        const existingUser = await db.master.findOne<User>("users", { name });

        if (existingUser) {
            return { status: 409, message: "User already exists" };
        }

        const hashedPassword = createHash("sha256").update(pass).digest("hex");

        const user = {
            name,
            pass: hashedPassword
        };

        await db.master.add("users", user);
        console.log("User created:", user);

        return { status: 201, message: "User created" };
    } catch (error) {
        console.error(error);
        return { status: 500, message: "Internal Server Error" };
    }
});

const authMiddleware: RouteHandler = async (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }

    console.log("Token:", token);

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
        console.log("Payload:", payload);
        next();
    } catch (error) {
        res.status(401);
        return res.json({ msg: "Unauthorized" });
    }
};

export { authMiddleware, router as authRouter };
