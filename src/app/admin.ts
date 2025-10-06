import { RouteHandler, Router } from "@wxn0brp/falcon-frame";
import { getContentType } from "@wxn0brp/falcon-frame/helpers";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { db } from "../db";
import { User } from "../types/auth";
import { sanitizeDirName, sanitizeFileName } from "./files";

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
    const users = await db.mail.getCollections();
    const result = [];
    for (const user of users) {
        const mails = await db.mail.find(user);
        result.push({ name: user, mails });
    }

    return result;
});

router.get("/files/:file", async (req, res) => {
    const { user, name } = req.query;
    const { file } = req.params;
    if (!user || !name) {
        res.status(400);
        return res.json({ message: "User and name name are required" });
    }
    const filePath = join("data", "files", sanitizeDirName(user), sanitizeDirName(name), sanitizeFileName(file));

    if (!existsSync(filePath)) {
        res.status(404);
        return res.json({ message: "File not found" });
    }

    const ct = getContentType(filePath);
    res.setHeader("Content-Type", ct);
    res.sendFile(filePath);
});

router.get("/version", async (req, res) => {
    try {
        const currentSHA = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();

        let remoteSHA = "";
        try {
            execSync("git fetch origin", { encoding: "utf-8" });
            remoteSHA = execSync("git rev-parse origin/HEAD", { encoding: "utf-8" }).trim();
        } catch (error) {
            console.log("Could not get remote SHA, continuing with local SHA only:", error);
        }

        const isCurrent = !remoteSHA || currentSHA === remoteSHA;

        return res.json({
            sha: currentSHA && remoteSHA,
            isCurrent
        });
    } catch (error) {
        console.error("Error getting git info:", error);
        res.status(500);
        return res.json({
            error: "Could not retrieve git information",
            isCurrent: false
        });
    }
});

export const sse = router.sse("/sse");

export {
    router as adminRouter
};
