import { Router } from "@wxn0brp/falcon-frame";
import { createLangRouter } from "@wxn0brp/falcon-frame-lang";
import { adminRouter } from "./admin";
import { authMiddleware, authRouter } from "./auth";
import { filesRouter } from "./files";

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

router.get("/page/:name", createLangRouter({
    meta: {
        login: { title: "Login" },
        register: { title: "Register" },
        mails: { title: "Mails" },
        upload: { title: "Upload Files" },
        admin: { title: "Admin" }
    },
    dir: "public",
    langDir: "public/lang",
    layout: "public/layout.html",
}));

export {
    router as masterRouter
};
