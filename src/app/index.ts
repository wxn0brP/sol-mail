import { renderHTML, Router } from "@wxn0brp/falcon-frame";
import { filesRouter } from "./files";
import { authRouter, authMiddleware } from "./auth";
import { adminRouter } from "./admin";
import { existsSync, readFileSync } from "fs";
import { title } from "process";

const router = new Router();

const api = new Router();
api.use(authMiddleware);
api.use("/files", filesRouter);
api.use("/admin", adminRouter);
router.use("/api", api);

router.use("/auth", authRouter);

const app = new Router();
app.static("/", "public/assets");
app.static("/lang", "public/lang");
app.static("/", "front/dist");
router.use("/app", app);

const pageMeta = {
    login: {
        title: "Login"
    },
    mails: {
        title: "Mails"
    },
    upload: {
        title: "Upload Files"
    },
    admin: {
        title: "Admin"
    }
}

router.get("/page/:name", (req, res, next) => {
    const name = req.params.name;
    const meta = pageMeta[name];
    if (!meta) return next();

    let acceptLang = "en";
    let langData = {};

    let userLang = req.cookies.lang || req.headers["accept-language"];
    if (userLang)
        acceptLang = userLang.split(",")[0].split(";")[0].split("-")[0];

    if (acceptLang !== "en") {
        const path = "public/lang/" + acceptLang + ".json";
        if (existsSync(path))
            langData = JSON.parse(readFileSync(path, "utf-8"));
    }

    const main = renderHTML(`public/${name}.html`, {});
    let html = renderHTML("public/layout.html", {
        title: meta.title,
        body: main,
        name
    });

    for (const key in langData) {
        html = html.replaceAll(`>${key}</`, `>${langData[key]}</`);
        html = html.replaceAll(`translate-placeholder="${key}"`, `placeholder="${langData[key]}" translate-placeholder="${key}"`);
    }
    res.ct("text/html");
    res.end(html);
});

export {
    router as masterRouter
};