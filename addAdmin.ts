import { Valthera } from "@wxn0brp/db";

const db = new Valthera("data/master");
const name = process.argv[2];
let enable: any = process.argv[3];
try {
    enable = JSON.parse(enable);
} catch (error) {
    enable = true;
}

const user = await db.updateOne("users", { name }, { admin: !!enable });
if (!user) {
    console.error(`User ${name} not found`);
    process.exit(1);
}