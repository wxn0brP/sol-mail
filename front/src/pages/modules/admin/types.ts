import { Mail } from "#types";

export interface GroupedByMail {
    name: string;
    users: { name: string; mail: Mail }[];
}

export interface User {
    name: string;
    mails: Mail[];
}

export type GroupBy = "user" | "mailName";
