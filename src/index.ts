import { configDotenv } from "dotenv";

configDotenv({ quiet: true });

await import("./main");