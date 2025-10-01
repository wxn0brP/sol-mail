import { Router } from "@wxn0brp/falcon-frame";
import busboy from "busboy";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import { getContentType } from "@wxn0brp/falcon-frame/helpers";
import { sse } from "./admin";
import { db } from "../db";

const router = new Router();

if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}
if (!fs.existsSync("data/files")) {
    fs.mkdirSync("data/files");
}

export function sanitizeDirName(name: string): string {
    return name.replace(/[^a-zA-Z0-9-_]/g, "_");
}

export function sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9-_.]/g, "_");
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
        const sanitizedUserName = sanitizeDirName(user.name);
        const sanitizedMailName = sanitizeDirName(mailName);

        if (fs.existsSync(path.join("data", "files", sanitizedUserName, sanitizedMailName))) {
            res.writeHead(409, { "Connection": "close" });
            return res.json({ err: true, msg: "Mail directory already exists" });
        }

        const additionalFields: { [key: string]: string } = {};
        const uploads = [];
        const mail: any = {
            name: mailName,
            files: []
        }

        const bb = busboy({
            headers: req.headers,
            limits: {
                fileSize: MAX_FILE_SIZE,
                files: MAX_FILES_COUNT,
                fields: MAX_FILES_COUNT + 2
            }
        });

        bb.on("field", (fieldname, value) => {
            additionalFields[fieldname] = value.toString();
        });

        bb.on("file", (fieldname, file, { filename }) => {
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
        });

        bb.on("finish", async () => {
            try {
                await Promise.all(uploads);
                res.writeHead(200, { "Connection": "close" });
                res.json({ err: false, msg: "File uploaded successfully" });
                mail.txt = additionalFields.txt;
                const m = await db.mail.add(sanitizedUserName, mail);
                sse.sendAll({
                    ...m,
                    user: user.name
                });
            } catch (err) {
                console.error("Pipeline failed.", err);
                res.writeHead(500, { "Connection": "close" });
                res.json({ err: true, msg: "An error occurred during file upload." });
            }
        });

        bb.on("error", (err) => {
            console.error("Busboy error:", err);
            res.writeHead(500, { "Connection": "close" });
            res.json({ err: true, msg: "An error occurred during file upload." });
        });

        req.pipe(bb);

    } catch (error) {
        console.error("Error setting up busboy:", error);
        res.writeHead(500, { "Connection": "close" });
        res.json({ err: true, msg: "An error occurred during file upload." });
    }
});

router.get("/mails", async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401);
            return res.json({ message: "Unauthorized" });
        }

        const sanitizedUserName = sanitizeDirName(user.name);
        const mails = await db.mail.find(sanitizedUserName);
        return res.json(mails);
    } catch (error) {
        console.error("Error listing mail files:", error);
        res.status(500);
        return res.json({ message: "Internal Server Error" });
    }
});

router.get("/", async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401);
            return res.json({ message: "Unauthorized" });
        }

        const { name, file } = req.query;
        if (!name || !file) {
            res.status(400);
            return res.json({ message: "Mail name and file name are required" });
        }

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