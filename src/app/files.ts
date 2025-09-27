import { Router } from "@wxn0brp/falcon-frame";
import busboy from "busboy";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";

const router = new Router();

if (!fs.existsSync("data/tmp")) {
    fs.mkdirSync("data/tmp");
}

router.customParser("/", async (req, res) => {
    try {
        const bb = busboy({ headers: req.headers });
        const uploads = [];

        bb.on("file", (_, file, { filename }) => {
            const saveTo = path.join("data/tmp", path.basename(filename));
            console.log(`Uploading to: ${saveTo}`);
            const uploadPromise = pipeline(file, fs.createWriteStream(saveTo));
            uploads.push(uploadPromise);
        });

        bb.on("finish", async () => {
            try {
                await Promise.all(uploads);
                res.writeHead(200, { "Connection": "close" });
                res.end("File upload finished.");
            } catch (err) {
                console.error("Pipeline failed.", err);
                res.writeHead(500, { "Connection": "close" });
                res.end("An error occurred during file processing.");
            }
        });

        bb.on("error", (err) => {
            console.error("Busboy error:", err);
            res.writeHead(500, { "Connection": "close" });
            res.end("An error occurred during file upload.");
        });

        req.pipe(bb);

    } catch (error) {
        console.error("Error setting up busboy:", error);
        res.writeHead(500, { "Connection": "close" });
        res.end("An internal server error occurred.");
    }
});

export {
    router as filesRouter
};