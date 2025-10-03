import { renderHTML, Router } from "@wxn0brp/falcon-frame";
import { filesRouter } from "./files";
import { authRouter, authMiddleware } from "./auth";
import { adminRouter } from "./admin";

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

    res.render("public/layout", {
        title: meta.title,
        body: renderHTML(`public/${name}.html`, {}),
        name,
    })
});

export {
    router as masterRouter
};