import { Router } from "@wxn0brp/falcon-frame";
import { db } from "../db";

export const dataRouter = new Router();

dataRouter.get("/subjects", async (_, res) => {
    const subjects = await db.master.find("subjects");
    return res.json(subjects.map(subject => subject._id));
});