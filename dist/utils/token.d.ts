import { User } from "../types/auth.js";
import { FFResponse } from "@wxn0brp/falcon-frame";
export declare function setToken(user: Pick<User, "name" | "_id">, res?: FFResponse): Promise<{
    token: string;
    exp: Date;
    expirationTime: number;
}>;
