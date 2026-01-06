export interface User {
    id: number | string;
    username: string;
    email: string;
    avatar: string;
    bio?: string;
    createdAt: Date;
}
