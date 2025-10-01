export interface User {
    _id: string;
    name: string;
    pass: string;
    admin?: true;
}
declare module "@wxn0brp/falcon-frame" {
    interface FFRequest {
        user?: {
            name: string;
            _id: string;
        };
    }
}
