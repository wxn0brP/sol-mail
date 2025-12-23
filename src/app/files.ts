import { Router } from "@wxn0brp/falcon-frame";
import { getContentType } from "@wxn0brp/falcon-frame/helpers";
import busboy from "busboy";
import fs, { rmSync } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { db } from "../db";
import { sse } from "./admin";
import { sanitizeDirName, sanitizeFileName } from "../utils/sanitize";

const router = new Router();

if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}
if (!fs.existsSync("data/files")) {
    fs.mkdirSync("data/files");
}

let MAX_FILE_SIZE = 0;
if (process.env.MAX_FILE_SIZE) {
    MAX_FILE_SIZE = +process.env.MAX_FILE_SIZE;
} else {
    MAX_FILE_SIZE = 20;
}
MAX_FILE_SIZE *= 1024 * 1024;
const MAX_FILES_COUNT = +process.env.MAX_FILES_COUNT || 10;
console.log(`File upload limit: ${MAX_FILE_SIZE}B (${MAX_FILE_SIZE / 1024 / 1024}MB)`);
console.log(`File count limit: ${MAX_FILES_COUNT} files`);

router.customParser("/:mailName", async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.writeHead(401, { "Connection": "close" });
            return res.json({ err: true, msg: "Unauthorized" });
        }

        const mailName = req.params.mailName;
        if (!mailName) {
            res.writeHead(400, { "Connection": "close" });
            return res.json({ err: true, msg: "Mail name is required" });
        }

        const userType = await db.master.findOne<any>("users", { _id: user._id });
        const isAdmin = userType?.admin;
        if (isAdmin)
            user.name = "public";

        const sanitizedUserName = sanitizeDirName(user.name);
        const sanitizedMailName = sanitizeDirName(mailName);

        if (fs.existsSync(path.join("data", "files", sanitizedUserName, sanitizedMailName))) {
            res.writeHead(409, { "Connection": "close" });
            return res.json({ err: true, msg: "Mail directory already exists" });
        }

        const additionalFields: { [key: string]: string } = {};
        const uploads: Promise<void>[] = [];
        const mail: any = { name: mailName, files: [] };

        let requestAborted = false;

        const bb = busboy({
            headers: req.headers,
            defParamCharset: "utf8",
            limits: {
                fileSize: MAX_FILE_SIZE,
                files: MAX_FILES_COUNT,
                fields: MAX_FILES_COUNT + 2,
                fieldNameSize: 512,
                fieldSize: 10 * 1048576, // 10MB
            },
        });

        bb.on("field", (fieldname, value) => {
            additionalFields[fieldname] = value.toString();
        });

        bb.on("file", (fieldname, file, { filename }) => {
            if (requestAborted)
                return file.resume();

            const mailDir = path.join("data", "files", sanitizedUserName, sanitizedMailName);
            if (!fs.existsSync(mailDir)) {
                fs.mkdirSync(mailDir, { recursive: true });
            }

            const sanitizedFileName = sanitizeFileName(path.basename(filename));
            const saveTo = path.join(mailDir, sanitizedFileName);
            console.log(`Uploading to: ${saveTo}`);

            const uploadPromise = pipeline(file, fs.createWriteStream(saveTo));
            uploads.push(uploadPromise);

            mail.files.push(filename);

            file.on("limit", () => {
                console.warn(`File ${filename} exceeded the limit of ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
                requestAborted = true;
                rmSync(mailDir, { recursive: true, force: true });

                res.writeHead(413, { "Connection": "close" });
                res.json({ err: true, msg: `File ${filename} is too large.` });
                file.resume();
            });
        });

        bb.on("finish", async () => {
            if (requestAborted) return;

            try {
                await Promise.all(uploads);
                res.writeHead(200, { "Connection": "close" });
                res.json({ err: false, msg: "File uploaded successfully" });

                mail.txt = additionalFields.body;
                const m = await db.mail.add(sanitizedUserName, mail);
                sse.sendAll({
                    ...m,
                    user: user.name
                });
            } catch (err) {
                console.error("Pipeline failed.", err);
                if (!res._ended) {
                    res.writeHead(500, { "Connection": "close" });
                    res.json({ err: true, msg: "An error occurred during file upload." });
                }
            }
        });

        bb.on("error", (err) => {
            console.error("Busboy error:", err);
            if (!res._ended) {
                res.writeHead(500, { "Connection": "close" });
                res.json({ err: true, msg: "An error occurred during file upload." });
            }
        });

        bb.on("filesLimit", () => {
            console.warn(`Too many files uploaded. Limit is ${MAX_FILES_COUNT}.`);
            requestAborted = true;
            res.writeHead(413, { "Connection": "close" });
            res.json({ err: true, msg: `Too many files uploaded. Limit is ${MAX_FILES_COUNT}.` });
        });

        req.pipe(bb);

    } catch (error) {
        console.error("Error setting up busboy:", error);
        if (!res._ended) {
            res.writeHead(500, { "Connection": "close" });
            res.json({ err: true, msg: "An error occurred during file upload." });
        }
    }
});

router.get("/mails", async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401);
            return res.json({ message: "Unauthorized" });
        }
        if (req.query.public) user.name = "public";

        const sanitizedUserName = sanitizeDirName(user.name);
        return await db.mail.find(sanitizedUserName);
    } catch (error) {
        console.error("Error listing mail files:", error);
        res.status(500);
        return res.json({ message: "Internal Server Error" });
    }
});

router.get("/files/:file", async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401);
            return res.json({ message: "Unauthorized" });
        }

        const { file } = req.params;
        const { name } = req.query;
        if (!name) {
            res.status(400);
            return res.json({ message: "Mail name are required" });
        }
        if (req.query.user == "public") user.name = "public";

        const sanitizedUserName = sanitizeDirName(user.name);
        const sanitizedMailName = sanitizeDirName(name);
        const sanitizedFileName = sanitizeFileName(file);
        const filePath = path.join("data", "files", sanitizedUserName, sanitizedMailName, sanitizedFileName);

        if (!fs.existsSync(filePath)) {
            res.status(404);
            return res.json({ message: "File not found" });
        }

        const ct = getContentType(filePath);
        res.setHeader("Content-Type", ct);
        res.sendFile(filePath);
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500);
        return res.json({ message: "Internal Server Error" });
    }
});

export {
    router as filesRouter
};
