import { User } from "./user.interface";

export interface Comment {
  id: string | number;
  postId: string | number;
  userId: User['id'];
  username: User['username'];
  avatar: User['avatar'];
  text: string;
  createdAt: string;
}
