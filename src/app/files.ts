import { Router } from "@wxn0brp/falcon-frame";
import busboy from "busboy";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import { getContentType } from "@wxn0brp/falcon-frame/helpers";

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

        const additionalFields: { [key: string]: string } = {};
        const uploads = [];

        const bb = busboy({ headers: req.headers });

        bb.on("field", (fieldname, value) => {
            additionalFields[fieldname] = value.toString();
        });

        bb.on("file", (fieldname, file, { filename }) => {
            const sanitizedUserName = sanitizeDirName(user.name);
            const sanitizedMailName = sanitizeDirName(mailName);
            const mailDir = path.join("data", "files", sanitizedUserName, sanitizedMailName);
            if (!fs.existsSync(mailDir)) {
                fs.mkdirSync(mailDir, { recursive: true });
            }

            const sanitizedFileName = sanitizeFileName(path.basename(filename));
            const saveTo = path.join(mailDir, sanitizedFileName);
            console.log(`Uploading to: ${saveTo}`);
            const uploadPromise = pipeline(file, fs.createWriteStream(saveTo));
            uploads.push(uploadPromise);
        });

        bb.on("finish", async () => {
            try {
                await Promise.all(uploads);
                res.writeHead(200, { "Connection": "close" });
                res.json({ err: false, msg: "File uploaded successfully" });
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

router.get("/", async (req) => {
    try {
        const user = req.user;
        if (!user) return { status: 401, message: "Unauthorized" };

        const sanitizedUserName = sanitizeDirName(user.name);
        const userDir = path.join("data", "files", sanitizedUserName);

        if (!fs.existsSync(userDir)) {
            return { mails: [] };
        }

        const mailDirs = fs.readdirSync(userDir).filter(item => {
            const itemPath = path.join(userDir, item);
            return fs.statSync(itemPath).isDirectory();
        });

        return { mails: mailDirs };
    } catch (error) {
        console.error("Error listing mail directories:", error);
        return { status: 500, message: "Internal Server Error" };
    }
});

router.get("/:mailName", async (req) => {
    try {
        const user = req.user;
        if (!user) return { status: 401, message: "Unauthorized" };

        const mailName = req.params.mailName;
        if (!mailName) {
            return { status: 400, message: "Mail name is required" };
        }

        const sanitizedUserName = sanitizeDirName(user.name);
        const sanitizedMailName = sanitizeDirName(mailName);
        const mailDir = path.join("data", "files", sanitizedUserName, sanitizedMailName);

        if (!fs.existsSync(mailDir)) {
            return { status: 404, message: "Mail directory not found" };
        }

        const files = fs.readdirSync(mailDir).filter(item => {
            const itemPath = path.join(mailDir, item);
            return fs.statSync(itemPath).isFile();
        });

        return { files };
    } catch (error) {
        console.error("Error listing mail files:", error);
        return { status: 500, message: "Internal Server Error" };
    }
});

router.get("/:mailName/:fileName", async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401);
            return res.json({ message: "Unauthorized" });
        }

        const { mailName, fileName } = req.params;

        const sanitizedUserName = sanitizeDirName(user.name);
        const sanitizedMailName = sanitizeDirName(mailName);
        const sanitizedFileName = sanitizeFileName(fileName);
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