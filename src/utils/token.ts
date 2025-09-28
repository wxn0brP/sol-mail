import { SignJWT } from "jose";
import { parseTimeToMs } from "./time";
import { User } from "../types/auth";
import { FFResponse } from "@wxn0brp/falcon-frame";

export async function setToken(user: Pick<User, "name" | "_id">, res?: FFResponse) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";
    const tokenLifetime = process.env.TOKEN_LIFETIME || "2h";

    const jwt = await new SignJWT({ name: user.name, _id: user._id })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer("urn:example:issuer")
        .setAudience("urn:example:audience")
        .setExpirationTime(tokenLifetime)
        .sign(secret);

    const expirationTime = parseTimeToMs(tokenLifetime);
    const exp = new Date(Date.now() + expirationTime);

    if (res) res.setHeader(
        "Set-Cookie",
        `token=${jwt}; Path=/; Secure=false; SameSite=Lax; Expires=${exp.toUTCString()}`
    );

    return {
        token: jwt,
        exp
    }
}