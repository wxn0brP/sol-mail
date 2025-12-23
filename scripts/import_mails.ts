import { Valthera } from "@wxn0brp/db";
import fs from "fs";
import path from "path";
import { sanitizeDirName, sanitizeFileName } from "../src/utils/sanitize";

const IMPORT_DIR = "./import";
const DATA_DIR = "./data/files";

if (!fs.existsSync(IMPORT_DIR)) {
    console.log(`Directory not found: ${IMPORT_DIR}`);
    process.exit(1);
}

const dbMail = new Valthera("data/mail");

const mailDirs = fs.readdirSync(IMPORT_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const mailDirName of mailDirs) {
    const sanitizedMailName = sanitizeDirName(mailDirName);
    const sourceDir = path.join(IMPORT_DIR, mailDirName);
    const destDir = path.join(DATA_DIR, "public", sanitizedMailName);

    if (fs.existsSync(destDir)) {
        console.log(`Mail directory already exists, skipping: ${sanitizedMailName}`);
        continue;
    }

    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(sourceDir);
    const sanitizedFiles = files.map(file => sanitizeFileName(file));
    for (let i = 0; i < files.length; i++) {
        const sourceFile = path.join(sourceDir, files[i]);
        const destFile = path.join(destDir, sanitizedFiles[i]);
        fs.renameSync(sourceFile, destFile);
    }

    const mail = {
        name: sanitizedMailName,
        files: sanitizedFiles,
    };

    await dbMail.add("public", mail);
    fs.rmdirSync(sourceDir, { recursive: true });

    console.log(`Imported mail: ${sanitizedMailName}`);
}
