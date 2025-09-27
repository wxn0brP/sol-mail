import FalconFrame from "@wxn0brp/falcon-frame";
import { masterRouter } from "./app";
import "./db";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const app = new FalconFrame({
    loggerOpts: {
        // logLevel: "DEBUG"
    }
});

app.static("public");
app.static("front/dist");
app.use("/", masterRouter);

app.get("/*", () => ({ status: 404, message: "Not Found" }));

app.listen(+process.env.PORT || 19851, true);