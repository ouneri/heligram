import { User } from "./user.interface";
import { Comment } from "./comment.interface";
import { Like } from "./like.interface";

export interface Post {
    id: User['id'];
    userId: User['id'];
    username: User['username'];
    avatar: User['avatar'];
    description: string;
    image: string;
    createdAt: string;
    likes?: Like[];
    comments?: Comment[];
    likesCount?: number;
    commentsCount?: number;
    isLiked?: boolean; // для текущего пользователя
}