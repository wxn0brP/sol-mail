import { RouteHandler } from "@wxn0brp/falcon-frame";
import { createHash } from "crypto";
import { db } from "../db";
import { User } from "../types/auth";
import { setToken } from "../utils/token";
import { cache } from "./auth";
import { cleanToken, Token } from "../utils/cleanToken";

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

        if (await db.master.findOne<Token>("token", { name: user.name })) {
            await cleanToken();
            return { err: true, msg: "User already logged in" };
        }

        const hashedPassword = createHash("sha256").update(pass).digest("hex");

        if (user.pass !== hashedPassword) {
            return { err: true, msg: "Invalid credentials" };
        }

        const { exp, token, expirationTime } = await setToken(user, res);
        cache.set(
            token,
            { _id: user._id, name: user.name },
            expirationTime
        );
        await db.master.add("token", { _id: token, name: user.name, exp: exp.getTime() });

        return { err: false, msg: "Login successful", expiresAt: exp.getTime() };
    } catch (error) {
        console.error(error);
        res.status(500);
        return res.json({ message: "Internal Server Error" });
    }
};