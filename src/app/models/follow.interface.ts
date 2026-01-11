import { User } from "./user.interface";

export interface Follow {
  id: string | number;
  followerId: User['id']; // кто подписывается
  followingId: User['id']; // на кого подписываются
  createdAt: string;
}
