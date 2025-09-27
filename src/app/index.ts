import { Router } from "@wxn0brp/falcon-frame";
import { filesRouter } from "./files";
import { authRouter, authMiddleware } from "./auth";

const router = new Router();

const api = new Router();
api.use(authMiddleware);
api.use("/files", filesRouter);
router.use("/api", api);

router.use("/auth", authRouter);

export {
    router as masterRouter
};