export interface User {
    _id: string;
    name: string;
    pass: string;
}

declare module "@wxn0brp/falcon-frame" {
    interface FFRequest {
        user?: {
            name: string;
            _id: string;
        };
    }
}
