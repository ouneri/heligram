import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Authservices } from '../../services/authservices';
import { FollowService } from '../../services/follow.service';
import { PostService } from '../../services/post-service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.interface';
import { Post } from '../../models/post.interface';
import { Follow } from '../../models/follow.interface';

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
  showEditModal= false;
  editUsername: string = '';
  editBio: string = '';
  editAvatar: string = '';
  isDeleting = false;
  showModalFolowers = false;
  showModalSubscribes = false;
  listModalUsers: User[] = [];
  listModalTitle = '';
  listModalLoading = false;


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

    openModalFollowers(): void {
      if (!this.userId) return;
      this.listModalTitle = 'Подписчики';
      this.listModalUsers = [];
      this.listModalLoading = true;
      this.showModalFolowers = true;
      this.cdr.detectChanges();

      this.followService.getFollowers(this.userId).pipe(
        switchMap((follows) => {
          const ids = follows.map((f) => f.followerId);
          if (ids.length === 0) return of([]);
          return forkJoin(ids.map((id) => this.authService.getUserById(String(id)))).pipe(
            catchError(() => of([]))
          );
        })
      ).subscribe({
        next: (users) => {
          this.listModalUsers = users;
          this.listModalLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.listModalLoading = false;
          this.cdr.detectChanges();
        }
      });
    }

    openModalFollowing(): void {
      if (!this.userId) return;
      this.listModalTitle = 'Подписки';
      this.listModalUsers = [];
      this.listModalLoading = true;
      this.showModalSubscribes = true;
      this.cdr.detectChanges();

      this.followService.getFollowing(this.userId).pipe(
        switchMap((follows) => {
          const ids = follows.map((f) => f.followingId);
          if (ids.length === 0) return of([]);
          return forkJoin(ids.map((id) => this.authService.getUserById(String(id)))).pipe(
            catchError(() => of([]))
          );
        })
      ).subscribe({
        next: (users) => {
          this.listModalUsers = users;
          this.listModalLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.listModalLoading = false;
          this.cdr.detectChanges();
        }
      });
    }

    closeListModal(): void {
      this.showModalFolowers = false;
      this.showModalSubscribes = false;
      this.listModalUsers = [];
      this.listModalTitle = '';
      this.cdr.detectChanges();
    }

    goToUserProfile(userId: string | number): void {
      this.closeListModal();
      this.router.navigate(['/main/profile', userId]);
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

    DeletePostId(postId: string | number){
      if(this.isDeleting){
        return
      }

      if(!confirm('Удалить пост?')){
        return
      }
      this.isDeleting = true
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.loadUserPosts();
          this.isDeleting = false;
          this.notificationService.success('Пост удалён');
        },
        error: (error) => {
          this.notificationService.error('Ошибка при удалении поста');
          this.isDeleting = false
        }
      })

    }

    isOwnProfile(): boolean {
      return this.currentUser?.id.toString() === this.userId;
    }

    trackByPostId(index: number, post: Post): string | number {
      return post.id;
    }

    trackByUserId(index: number, user: User): string | number {
      return user.id;
    }

    navigateToPost(postId: string | number): void {
      this.router.navigate(['/main/post', postId]);
    }



    onOpenEditModal() {
      this.showEditModal = true;
      this.editUsername = this.user?.username ?? '';
      this.editBio = this.user?.bio ?? '';
      this.editAvatar = this.user?.avatar ?? '';

    }

    handlerFileInput(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.editAvatar = e.target.result as string;
            this.cdr.detectChanges();
          }
        };
        reader.readAsDataURL(file);
      }
    }


    onCloseEditModal() {
      this.showEditModal = false;
    }

    onSaveProfile() {
      if (!this.userId || !this.user) return;

      this.authService.updateUser(this.userId, { username: this.editUsername, bio: this.editBio, avatar: this.editAvatar}).subscribe({
        next: (user) => {
          this.user = user;
          this.onCloseEditModal();
          this.cdr.detectChanges();
          if (this.isOwnProfile()) {
            this.authService.updateCurrentUser(user);
          }
        },
        error: () => {
          this.notificationService.error('Ошибка при сохранении');
        }
      });
    }
  }
