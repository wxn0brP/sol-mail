import { RouteHandler, Router } from "@wxn0brp/falcon-frame";
import { AnotherCache } from "@wxn0brp/ac";
import { User } from "../types/auth.js";
import { Token } from "../utils/cleanToken.js";
declare const router: Router;
export declare const cache: AnotherCache<Pick<User, "_id" | "name">, string>;
export declare const inDbCache: AnotherCache<Token, string>;
declare const authMiddleware: RouteHandler;
export { authMiddleware, router as authRouter };
