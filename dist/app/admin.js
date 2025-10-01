import { Router } from "@wxn0brp/falcon-frame";
import { getContentType } from "@wxn0brp/falcon-frame/helpers";
import { existsSync } from "fs";
import { join } from "path";
import { db } from "../db/index.js";
import { sanitizeDirName, sanitizeFileName } from "./files.js";
const router = new Router();
const checkAdmin = async (req, res, next) => {
    const user = req.user;
    if (!user)
        return { err: true, msg: "Unauthorized" };
    const dbUser = await db.master.findOne("users", { _id: user._id });
    if (!dbUser || dbUser.admin !== true)
        return { err: true, msg: "Unauthorized" };
    next();
};
router.use(checkAdmin);
router.get("/users", async (req, res) => {
    const users = await db.master.find("users", {}, {}, { select: ["name"] });
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
router.get("/files", async (req, res) => {
    const { user, name, file } = req.query;
    if (!user || !name || !file) {
        res.status(400);
        return res.json({ message: "User, name and file name are required" });
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
export const sse = router.sse("/sse");
export { router as adminRouter };
