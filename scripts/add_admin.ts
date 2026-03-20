import { ValtheraCreate } from "@wxn0brp/db";
import { prompt, rl } from "./utils";

const db = ValtheraCreate("data/master");
let name = process.argv[2] || await prompt("Enter the name: ");
let enable: any = process.argv[3];
try {
    enable = JSON.parse(enable);
} catch (error) {
    enable = true;
}
rl.close();

const user = await db.c("users").updateOne({ name }, { admin: !!enable });
if (!user) {
    console.error(`User ${name} not found`);
    process.exit(1);
}
