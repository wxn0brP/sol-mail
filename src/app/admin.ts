import { RouteHandler, Router } from "@wxn0brp/falcon-frame";
import { User } from "../types/auth";
import { db } from "../db";
import { existsSync, readdirSync } from "fs";
import { sanitizeDirName, sanitizeFileName } from "./files";
import { join } from "path";
import { getContentType } from "@wxn0brp/falcon-frame/helpers";

const router = new Router();

const checkAdmin: RouteHandler = async (req, res, next) => {
    const user = req.user;
    if (!user) return { err: true, msg: "Unauthorized" };

    const dbUser = await db.master.findOne<User>("users", { _id: user._id });
    if (!dbUser || dbUser.admin !== true) return { err: true, msg: "Unauthorized" };

    next();
}

router.use(checkAdmin);

router.get("/users", async (req, res) => {
    const users = await db.master.find<User>("users", {}, {}, { select: ["name"] });
    return res.json(users.map(user => user.name));
});

router.get("/user-data", async () => {
    const data = readdirSync("data/files", { recursive: true, withFileTypes: true });

    const result = [];

    for (const entry of data) {
        if (entry.isFile()) {
            const path = entry.parentPath.replace(/\\/g, "/");
            const parts = path.split("/");

            const mailName = sanitizeDirName(parts[parts.length - 1]);
            const userName = sanitizeDirName(parts[parts.length - 2]);

            let user = result.find(u => u.name === userName);
            if (!user) {
                user = { name: userName, mails: [] };
                result.push(user);
            }

            let mail = user.mails.find(m => m.name === mailName);
            if (!mail) {
                mail = { name: mailName, files: [] };
                user.mails.push(mail);
            }

            mail.files.push(sanitizeFileName(entry.name));
        }
    }

    return result;
});

router.get("/files/:user/:mail/:file", async (req, res) => {
    const { user, mail, file } = req.params;
    const filePath = join("data", "files", sanitizeDirName(user), sanitizeDirName(mail), sanitizeFileName(file));

    if (!existsSync(filePath)) {
        res.status(404);
        return res.json({ message: "File not found" });
    }

    const ct = getContentType(filePath);
    res.setHeader("Content-Type", ct);
    res.sendFile(filePath);
});

export {
    router as adminRouter
}