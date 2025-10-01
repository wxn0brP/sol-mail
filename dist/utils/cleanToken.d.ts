export interface Token {
    _id: string;
    name: string;
    exp: number;
}
export declare function cleanToken(): Promise<void>;
