import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Authservices} from '../../services/authservices';
import {FollowService} from '../../services/follow.service';
import {PostService} from '../../services/post-service';
import {NotificationService} from '../../services/notification.service';
import { User } from '../../models/user.interface';
import { Post } from '../../models/post.interface';
import {Follow} from '../../models/follow.interface';

@Component({
  selector: 'app-profilelist',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profilelist.html',
  styleUrl: './profilelist.scss',
  standalone: true
})
export class Profilelist implements OnInit {

  userId: string | null = null;
  user: User | null = null;
  isLoading: boolean = true;
  isFollowing = false;
  isFollowLoading = false;
  followersCount = 0;
  followingCount = 0;
  postsCount = 0;
  userPosts: Post[] = [];
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: Authservices,
    private followService: FollowService,
    private postService: PostService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

    ngOnInit() {
      this.currentUser = this.authService.getCurrentUser();
      this.userId = this.route.snapshot.paramMap.get('id');
      if (this.userId) {
        this.loadUser();
        this.loadUserStats();
        this.loadUserPosts();
      }
    }

    loadUser(): void {
      if (!this.userId) return;

      this.isLoading = true;
      this.authService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.user = user;
          this.isLoading = false;
          this.checkFollowStatus();
          this.cdr.detectChanges();
          console.log('user loaded', user);
        },
        error: (error) => {
          console.error('error loaded', error);
          this.notificationService.error('Ошибка загрузки профиля');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }

    checkFollowStatus(): void {
      if (!this.userId || !this.currentUser) return;

      if (this.userId === this.currentUser.id.toString()) {
        this.isFollowing = false; // Нельзя подписаться на себя
        return;
      }

      this.followService.isFollowing(this.userId).subscribe({
        next: (isFollowing) => {
          this.isFollowing = isFollowing;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isFollowing = false;
        }
      });
    }

    loadUserStats(): void {
      if (!this.userId) return;

      this.followService.getFollowersCount(this.userId).subscribe({
        next: (count) => {
          this.followersCount = count;
          this.cdr.detectChanges();
        }
      });

      this.followService.getFollowingCount(this.userId).subscribe({
        next: (count) => {
          this.followingCount = count;
          this.cdr.detectChanges();
        }
      });
    }

    loadUserPosts(): void {
      if (!this.userId) return;

      this.postService.getPosts().subscribe({
        next: (posts) => {
          this.userPosts = posts.filter(post => post.userId.toString() === this.userId);
          this.postsCount = this.userPosts.length;
          this.cdr.detectChanges();
        },
        error: () => {
          this.postsCount = 0;
        }
      });
    }

    toggleFollow(): void {
      if (!this.userId || !this.currentUser || this.isFollowLoading) return;

      if (this.userId === this.currentUser.id.toString()) {
        return; // Нельзя подписаться на себя
      }

      this.isFollowLoading = true;
      if (this.isFollowing) {
        this.followService.unfollow(this.userId).subscribe({
          next: () => {
            this.isFollowing = false;
            this.followersCount -= 1;
            this.isFollowLoading = false;
            this.cdr.detectChanges();
            this.notificationService.success('Вы отписались');
          },
          error: (error: any) => {
            this.notificationService.error('Ошибка при подписке');
            this.isFollowLoading = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.followService.follow(this.userId).subscribe({
          next: () => {
            this.isFollowing = true;
            this.followersCount += 1;
            this.isFollowLoading = false;
            this.cdr.detectChanges();
            this.notificationService.success('Вы подписались');
          },
          error: (error: any) => {
            this.notificationService.error('Ошибка при подписке');
            this.isFollowLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    }

    isOwnProfile(): boolean {
      return this.currentUser?.id.toString() === this.userId;
    }

    // 🎓 TrackBy функция для постов пользователя
    trackByPostId(index: number, post: Post): string | number {
      return post.id;
    }
}
