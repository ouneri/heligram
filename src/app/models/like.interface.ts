import { User } from "./user.interface";

export interface Like {
  id: string | number;
  postId: string | number;
  userId: User['id'];
  createdAt: string;
}
