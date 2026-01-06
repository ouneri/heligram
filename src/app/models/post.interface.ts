import { User } from "./user.interface";



export interface Post {
    id: User['id'];
    userId: User['id'];
    username: User['username'];
    avatar: User['avatar'];
    description: string;
    image: string;
    createdAt: string;
    
}