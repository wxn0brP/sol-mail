import FalconFrame from "@wxn0brp/falcon-frame";
import { masterRouter } from "./app";
import "./db";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const app = new FalconFrame();

app.get("/server.find", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end("ok");
});
app.get("/", (_, res) => res.redirect("/page/upload"));
app.use("/", masterRouter);

app.get("/*", (req, res) => {
    res.status(404);
    return { status: 404, message: "Not Found" }
});

app.l(19851);