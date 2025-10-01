import { configDotenv } from "dotenv";
configDotenv({ quiet: true });
process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});
process.on("uncaughtException", (err, origin) => {
    console.error("Caught exception: ", err, "Exception origin: ", origin);
});
await import("./main.js");
