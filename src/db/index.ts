import { ValtheraCreate } from "@wxn0brp/db";
import { Token } from "../utils/cleanToken";
import { User } from "../types/auth";

export const db = {
    master: ValtheraCreate<{
        token: Token;
        users: User;
        subjects: {
            _id: string;
        };
    }>("data/master"),

    mail: ValtheraCreate("data/mail")
}
