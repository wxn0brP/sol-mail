import { RouteHandler } from "@wxn0brp/falcon-frame";
import { createHash } from "crypto";
import { SignJWT } from "jose";
import { db } from "../db";
import { User } from "../types/auth";

export const loginHandler: RouteHandler = async (req, res) => {
    try {
        const { name, pass } = req.body;

        if (!name || !pass) {
            return { err: true, msg: "Missing name or pass" };
        }

        const user = await db.master.findOne<User>("users", { name });

        if (!user) {
            return { err: true, msg: "User not found" };
        }

        const hashedPassword = createHash("sha256").update(pass).digest("hex");

        if (user.pass !== hashedPassword) {
            return { err: true, msg: "Invalid credentials" };
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

        const expirationTime = 2 * 60 * 60 * 1000;
        const expirationDate = new Date(Date.now() + expirationTime);

        res.setHeader(
            "Set-Cookie",
            `token=${jwt}; Path=/; Secure=false; SameSite=Lax; Expires=${expirationDate.toUTCString()}`
        );

        return { err: false, msg: "Login successful" };
    } catch (error) {
        console.error(error);
        res.status(500);
        return res.json({ message: "Internal Server Error" });
    }
};