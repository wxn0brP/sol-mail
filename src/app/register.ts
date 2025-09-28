import { RouteHandler } from "@wxn0brp/falcon-frame";
import { createHash } from "crypto";
import { db } from "../db";
import { User } from "../types/auth";

export const registerHandler: RouteHandler = async (req, res) => {
    try {
        const { name, pass } = req.body;

        if (!name || !pass) {
            return { err: true, msg: "Missing name or pass" };
        }

        const existingUser = await db.master.findOne<User>("users", { name });

        if (existingUser) {
            return { err: true, msg: "User already exists" };
        }

        const hashedPassword = createHash("sha256").update(pass).digest("hex");

        const user = {
            name,
            pass: hashedPassword
        };

        await db.master.add("users", user);
        console.log("User created:", user);

        return { err: false, msg: "User created successfully" };
    } catch (error) {
        console.error(error);
        res.status(500);
        return { err: true, msg: "Internal server error" };
    }
}