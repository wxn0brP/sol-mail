import { Router } from "@wxn0brp/falcon-frame";
import { adminRouter } from "./admin";
import { authMiddleware, authRouter } from "./auth";
import { filesRouter } from "./files";
import { dataRouter } from "./data";

const router = new Router();

const api = router.router("/api");
api.use(authMiddleware);
api.use("/files", filesRouter);
api.use("/admin", adminRouter);
api.use("/data", dataRouter);

router.use("/auth", authRouter);

router.static("public/shell");
router.static("public/assets");
router.static("/lang", "public/lang");
router.static("front/dist");

export { router as masterRouter };
